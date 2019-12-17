//import packages
const Web3 = require('web3');
const token = require('./src/abis/TokenMarketplace');
const Tx = require('ethereumjs-tx').Transaction;
let url = "https://ropsten.infura.io/v3/154a9cc2ac1f44ae88737a14e8b84a2c";
//define global variables
let principalAccount = "0x48a49eC7C463A3F747D325D58cDFb08f762Cf350";//account where others take ethers
let privateKeyAccount = "3BFEBD120FD629F8E14FF1088D2D9E9CD97AB2B83BEE6277CB4E5E395D270E97";
let web3;//web3 instance
let contract = null;//contract instance
let contractAddress;
let id;

//initialize web3
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider(url));
    Initialize();
}

async function Initialize(){
    //send eth to investors for interact with contract
    await sendETH("0x6192c2D89cc95764420b26d36861340Dd143177C");
    await sendETH("0x621d58Ed97F126d5DF7c55f951eaea87e888AFf1");
    await sendETH("0x6d53E5134EB72A66970Db0f13e11bb8eFa0aF550");
}

async function sendETH(_to){
    try{
        web3.eth.getBalance(_to).then(async(res) => {
            console.log(res);
            if(Number(res) / 1000000000000000000 < 1){ //check if have less than 1 eth
                let gasPrice = 20000000000;
                let gasLimit = 21000;         
                
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
                    if(err) throw err;
                });
            } 
        });
    }catch{
        console.log("error... while transaction");
    }
}
//interact with contract
function sendSignedTransaction(account,privateKey,data){
    return new Promise(async(resolve,reject) =>{
        let txCount = await web3.eth.getTransactionCount(account);
        let abi = data.encodeABI();

        let gasPrice = 20000000000;
        let gasLimit = 210000;

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
        .once("transactionHash",out=>{
            resolve(out);
        })
        .catch(err =>{
            reject(err);
        })
    });
}
//check if the previous transaction was successful
//and then send the next transaction
async function checkTransaction(_hash,_account,_privateKey,_data){
    return new Promise(async(resolve) =>{
        if(_hash === undefined || !_hash.includes("0x")){ //check if _hash is acceptable
            const h = await sendSignedTransaction(_account,_privateKey,_data);
            resolve(h);
        }else{
            web3.eth.getTransactionReceipt(_hash , async(err,res)=>{
                if(err) throw err;
                if(res != null){
                    const h = await sendSignedTransaction(_account,_privateKey,_data);
                    resolve(h);
                }else{
                    console.log("PREVIOUS TRANSACTION NOT FOUND");
                    resolve("err");
                }
            })
        }
    });
}
//on sign-in it creates a wallet for user
async function createWallet(){
    try{
        let account;
        account = web3.eth.accounts.create(web3.utils.randomHex(32));

        sendETH(account.address);//send eth to new address

        return({"address":account.address,"key":account.privateKey});
    }catch{
        return({"address" : "ERROR","key" : "error"});
    }
}
//get dollars and tokens balance from contract with calls
async function getInfo(_account){
    let _contract = await getContract();

    let dollars = await _contract.methods.dollars(_account).call();
    let tokens = await _contract.methods.getTokensBalance(_account).call();

    return({
        "dollars": Number(dollars),
        "tokens" : Number(tokens)
    });
}
//add dollars to dollar balance 
async function addDollars(_hash,_dollars,_account,_key){
    return new Promise(async(resolve) =>{
        let _contract = await getContract();

        const d = _contract.methods.depositDollars(_account,_dollars);//data

        checkTransaction(_hash,_account,_key,d).then(res =>{
            resolve(res);
        });
    });
}
//get all the other informations like offers
async function getAll(){
    let _contract = await getContract();
    let l = [];

    const count = await _contract.methods.offersIndex().call();
    //get list of offers
    for (let i = 0; i <= count-1; i++) {
        const offer = await _contract.methods.offers(i).call();

        if(offer["purchased"] === false){
            let newOffer = {"id":web3.utils.hexToNumber(offer["id"]["_hex"]),
                            "owner":offer["owner"],
                            "purchased":offer["purchased"],
                            "price":web3.utils.hexToNumber(offer["price"]["_hex"]),
                            "tokens":web3.utils.hexToNumber(offer["tokens"]["_hex"])};
            
            l.push(newOffer);
        }
    }
    return(l);
}
//it sells a offer
async function sell(_hash,_tokens,_price,_account,_key){
    return new Promise(async(resolve) =>{
        let _contract = await getContract();

        const d = _contract.methods.sell(_tokens,_price);
        
        checkTransaction(_hash,_account,_key,d).then(res =>{
            resolve(res);
        });
    });
}
//it buys a offer
async function buy(_hash,_id, _account,_key){
    return new Promise(async(resolve) =>{
        let _contract = await getContract();

        const d = _contract.methods.buy(_id);

        checkTransaction(_hash,_account,_key,d).then(res =>{
            resolve(res);
        });
    });
}
//initialize contract
const getContract = async() =>{
    if (contract === null) {
        const abi = token.abi;
        const networkId = await web3.eth.net.getId();
        id = networkId;

        const networkData = token.networks[networkId];
        contractAddress = networkData.address;

        let c = new web3.eth.Contract(abi, networkData.address);
        contract = c.clone();
        contract.options.address = networkData.address;
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