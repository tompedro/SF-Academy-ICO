const Web3 = require('web3');
const token = require('../src/abis/TokenMarketplace');
const Tx = require('ethereumjs-tx').Transaction;
let url = "http://localhost:7545";
let account;
let principalAccount = "0x05734fe68ec8E73C1b3ea730aDe850292F6c6603";
let privateKeyAccount = "2d889f8a1017df5fa74d6edcbf102244774921913887cc31d4b9356d0aee2f7b";
let web3;
let contract = null;
let id;


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider(url));
}

async function createWallet(){
    /*
    let gasPrice = 2;
    let gasLimit = 3000000;

    console.log("TRANSACTION FROM " + principalAccount);
    
    account = web3.eth.accounts.create(web3.utils.randomHex(32));
    console.log("privateKey: " + account.privateKey);
    console.log("address: " + account.address);

    id = await web3.eth.net.getId();
    let txCount = await web3.eth.getTransactionCount(principalAccount);

    let rawTransaction  = {
        "from" : principalAccount,
        "gasPrice" : web3.utils.toHex(gasPrice * 1e9),
        "nonce": web3.utils.toHex(txCount),
        "gasLimit" : web3.utils.toHex(gasLimit),
        "to" : account.address,
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
            web3.eth.getBalance(account.address).then(res => {
                console.log(res);
                
            });
            
        }else{
            console.log("ERROR =>> " + err);
            //return(account.address.toString());
        }
        
    });
    
    return(account.address.toString());*/
    return(principalAccount);
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
    let newBalance = await _contract.methods.depositDollars(_account,_dollars).send({from : _account});
    return(newBalance);
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
    getInfo : getInfo,
    addDollars: addDollars,
    web3 : web3
}