const Web3 = require('web3');
const token = require('../src/abis/TokenMarketplace');
const Tx = require('ethereumjs-tx').Transaction;
let url = "https://ropsten.infura.io/v3/154a9cc2ac1f44ae88737a14e8b84a2c";

let principalAccount = "0x48a49eC7C463A3F747D325D58cDFb08f762Cf350";
let privateKeyAccount = "3BFEBD120FD629F8E14FF1088D2D9E9CD97AB2B83BEE6277CB4E5E395D270E97";
let web3;
let contract = null;
let contractAddress;
let id;


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider(url));

    console.log("INITIALIZE WEB3....");
    Initialize().then(()=>{
        console.log("Finish...");
    })
    
}

async function Initialize(){
    await sendETH("0x6192c2D89cc95764420b26d36861340Dd143177C");
    await sendETH("0x621d58Ed97F126d5DF7c55f951eaea87e888AFf1");
    await sendETH("0x6d53E5134EB72A66970Db0f13e11bb8eFa0aF550");
}

async function sendETH(_to){
    try{
        web3.eth.getBalance(_to).then(async(res) => {
            if(Number(res) / 1000000000000000000 < 1){
                let gasPrice = 20000000000;
                let gasLimit = 21000;

                console.log("TRANSACTION TO " + _to);
                
                
                id = await web3.eth.net.getId();
                let txCount = await web3.eth.getTransactionCount(principalAccount);

                let rawTransaction  = {
                    "from" : principalAccount,
                    "gasPrice" : web3.utils.toHex(gasPrice),
                    "nonce": web3.utils.toHex(txCount),
                    "gasLimit" : web3.utils.toHex(gasLimit),
                    "to" : _to,
                    "value" : "0x1000000000000000"
                };

                let privKey = Buffer.from(privateKeyAccount,'hex');
                let tx = new Tx(rawTransaction,{ chain: 'ropsten'});

                tx.sign(privKey);
                let serializedTx = tx.serialize();
                
                
                web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err,hash){
                    if(!err){
                        console.log("Transaction Succesfully");
                        web3.eth.getBalance(_to).then(res => {
                            console.log(res);
                            
                        });
                        
                    }else{
                        console.log("ERROR =>> " + err);
                    }
                });
            }else{
                console.log("THIS ADDRESS HAVE ALREADY " + res.toString() + " ETH");
            }   
        });
    }catch{
        console.log("error... while transaction");
    }
}

function sendSignedTransaction(account,privateKey,data){
    console.log("====>>" + privateKey);
    return new Promise(async(resolve,reject) =>{
        let txCount = await web3.eth.getTransactionCount(account);
        let abi = data.encodeABI();
        console.log(txCount);
        let gasPrice = 2000000000;
        let gasLimit = 210000;

        console.log("this is contract address "  + contractAddress)

        let dataTrans = {
            
            to: contractAddress,
            data: abi,
            nonce: web3.utils.toHex(txCount),
            gasLimit: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice)
        };

        let tx = new Tx(dataTrans,{ chain: 'ropsten'});
        tx.sign(new Buffer.from(privateKey,'hex'));

        web3.eth.sendSignedTransaction("0x" + tx.serialize().toString("hex"))
        .then(out=>{
            console.log("finish " + out);
            resolve('success');
        })
        .catch(err =>{
            reject(err);
        })
    });
    
}


async function createWallet(){
    try{
        let account;
        account = web3.eth.accounts.create(web3.utils.randomHex(32));
        console.log("privateKey: " + account.privateKey);
        console.log("address: " + account.address);
        sendETH(account.address);   
        return(account.address.toString());
    }catch{
        return({"address" : "ERROR","key" : "error"});
    }
}

async function getInfo(_account){
    let _contract = await getContract();
    console.log("search for => " + _account.toString());
    let dollars = await _contract.methods.dollars(_account).call();
    let tokens = await _contract.methods.getTokensBalance(_account).call();
    console.log("find =>" + dollars.toString() + " " + tokens.toString());
    return({
        "dollars": Number(dollars),
        "tokens" : Number(tokens)
    });
}
async function addDollars(_dollars,_account,_key){
    let _contract = await getContract();
    console.log("search => " + _dollars);
    const m = _contract.methods.depositDollars(_account,_dollars);
    const result = await sendSignedTransaction(_account,_key,m);
    return(result);
}

async function getAll(){
    let _contract = await getContract();
    let l = [];
    const count = await _contract.methods.offersIndex().call()
    for (let i = 0; i <= count-1; i++) {
        const offer = await _contract.methods.offers(i).call()
        console.log("giro n° " + i.toString() + "=>" + JSON.stringify(offer));
        if(offer["purchased"] === false){
            console.log("id=>"+web3.utils.hexToNumber(offer["id"]["_hex"]));
            let newOffer = {"id":web3.utils.hexToNumber(offer["id"]["_hex"]),
                            "owner":offer["owner"],
                            "purchased":offer["purchased"],
                            "price":web3.utils.hexToNumber(offer["price"]["_hex"]),
                            "tokens":web3.utils.hexToNumber(offer["tokens"]["_hex"])};
            
            l.push(newOffer);
        }
    }
    console.log(JSON.stringify(l));
    return(l);
}

async function sell(_tokens,_price,_account,_key){
    let _contract = await getContract();
    const m = _contract.methods.sell(_tokens,_price);
    return(sendSignedTransaction(_account,_key,m).then());
}

async function buy(_id, _account,_key){
    let _contract = await getContract();
    const m = _contract.methods.buy(_id);
    return(sendSignedTransaction(_account,_key,m).then());
}

const getContract = async() =>{
    if (contract === null) {
        const abi = token.abi;
        const networkId = await web3.eth.net.getId();
        id = networkId;
        console.log(id);
        const networkData = token.networks[networkId];
        //console.log(networkData.address);
        contractAddress = networkData.address;
        let c = new web3.eth.Contract(abi, networkData.address);
        contract = c.clone();
        contract.options.address = networkData.address;
        console.log("Contract Initiated successfully!");
    }
    return contract;
}

module.exports = {
    createWallet : createWallet,
    sendETH : sendETH,
    getInfo : getInfo,
    addDollars: addDollars,
    sell:sell,
    getAll : getAll,
    buy : buy,
    web3 : web3
}