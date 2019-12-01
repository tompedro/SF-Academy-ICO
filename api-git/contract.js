const Web3 = require('web3');
const token = require('../src/abis/TokenMarketplace');
const Tx = require('ethereumjs-tx').Transaction;
let url = "http://localhost:7545";

let principalAccount = "0xF840C93fDB588799475E798D6947C9bFC45362b0";
let privateKeyAccount = "07860609F624AFDC6795F18174085A38D84C69E3BABD108226DA8BD16FD4F141";
let web3;
let contract = null;
let id;


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider(url));

    console.log("INITIALIZE WEB3....");
    await sendETH("0x9273f2c9a639DE53E979D2483efA1502335e8551");
    await sendETH("0x621d58Ed97F126d5DF7c55f951eaea87e888AFf1");
    await sendETH("0x6d53E5134EB72A66970Db0f13e11bb8eFa0aF550");
    console.log("Finish...");
}

async function sendETH(_to){
    try{
        web3.eth.getBalance(_to).then(res => {
            if(Number(res) === 0){
                let gasPrice = 2;
                let gasLimit = 3000000;

                console.log("TRANSACTION TO " + _to);
                
                
                id = await web3.eth.net.getId();
                let txCount = await web3.eth.getTransactionCount(principalAccount);

                let rawTransaction  = {
                    "from" : principalAccount,
                    "gasPrice" : web3.utils.toHex(gasPrice * 1e9),
                    "nonce": web3.utils.toHex(txCount),
                    "gasLimit" : web3.utils.toHex(gasLimit),
                    "to" : _to,
                    "value" : "0x3",
                    "chainId" : id
                };

                let privKey = Buffer.from(privateKeyAccount,'hex');
                let tx = new Tx(rawTransaction);

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
async function addDollars(_dollars,_account){
    let _contract = await getContract();
    console.log("search => " + _dollars);
    _contract.methods.depositDollars(_account,_dollars).send({from : _account},function(receipt){
        return("success");
    });
    
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

async function sell(_tokens,_price,_account){
    let _contract = await getContract();
    _contract.methods.sell(_tokens,_price).send({from : _account,gas : 200000}, function(receipt){
        return("success");
    });
}

async function buy(_id, _account){
    let _contract = await getContract();
    _contract.methods.buy(_id).send({from : _account,gas : 200000}).once('receipt',(receipt) =>{
        return("success");
    });
}

const getContract = async() =>{
    if (contract === null) {
        const abi = token.abi;
        const networkId = await web3.eth.net.getId();
        id = networkId;
        const networkData = token.networks[networkId];
        //console.log(networkData.address);
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