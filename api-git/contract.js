const Web3 = require('web3');
const token = require('../src/abis/TokenMarketplace');
const Tx = require('ethereumjs-tx').Transaction;
let url = "http://localhost:7545";
let account;
let principalAccount = "0x184918504A72938D0d149438a2B00AdD50D146b4";
let privateKeyAccount = "58fc6c75df7e8b3276fbb0bba066bd4150b44724af14a033a2a8c2aae3e8b644";
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

async function getAll(){
    let _contract = await getContract();
    let l = [];
    const count = await _contract.methods.offersIndex().call()
    for (let i = 0; i <= count; i++) {
        const offer = await _contract.methods.offers(i).call()

        console.log("id=>"+web3.utils.hexToNumber(offer["id"]["_hex"]));

        let newOffer = {"id":i,
                        "owner":offer["owner"],
                        "purchased":offer["purchased"],
                        "price":web3.utils.hexToNumber(offer["price"]["_hex"]),
                        "tokens":web3.utils.hexToNumber(offer["tokens"]["_hex"])};
        
        l.push(newOffer);
    }
    console.log(JSON.stringify(l));
    return(l);
}

async function sell(_tokens,_price,_account){
    let _contract = await getContract();

    let address = await _contract.methods.sell(_tokens,_price).send({from : _account,gas : 200000});
    return(address);
}

async function buy(_id, _account){
    let _contract = await getContract();

    let address = await _contract.methods.buy(_id).send({from : _account,gas : 200000});
    return(address);
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
    sell:sell,
    getAll : getAll,
    buy : buy,
    web3 : web3
}