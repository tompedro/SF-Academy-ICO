//import packages
let express = require("express");
let interface = require("../contract");
let mysql = require('mysql');
let router = express.Router();
let crypto = require('crypto');

//initialize connection with mysql database
let con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"password"
});

//function for insert investitors
function InsertInvestitor(cmd){
    con.query("INSERT INTO accounts(name,surname,mail,password,address,privatekey) VALUES("+cmd+")",(err)=>{
        if(err) throw err;
        console.log("Inserted investitor");
    });    
}

//init
//create database
con.connect(function(err) {              
    if(err) throw err;
    con.query("CREATE DATABASE IF NOT EXISTS db;",(err)=>{
        if(err) throw err;
        console.log("Database created");

        //initialize new connection

        con =  mysql.createConnection({
            host:"localhost",
            user:"root",
            password:"password",
            database : "db"
        });
        //create table

        con.query("CREATE TABLE IF NOT EXISTS accounts(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NOT NULL,surname VARCHAR(255) NOT NULL,mail VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,address VARCHAR(255) NOT NULL,privatekey VARCHAR(255) NOT NULL);",(err)=>{
            if(err) throw err;
            console.log("Table created");
            //check if there isn't investors yet
            
            con.query("SELECT name FROM accounts WHERE name = 'Elon' AND surname = 'Musk'",(err,res)=>{
                if(err) throw err;
                if(res[0] === undefined){ 
                    //insert Elon Musk
                    let pswHashed = crypto.createHmac('sha256', "key").update("Elon0").digest("hex");
                    InsertInvestitor("'Elon','Musk','elon@tesla.com','"+pswHashed+"','0x6d53E5134EB72A66970Db0f13e11bb8eFa0aF550','520B1422F135DD70375BCB41C4522E1E7BCD13164AF2E69D5905B9C85F0F72D0'");
                    
                    //insert Bill Gates
                    pswHashed = crypto.createHmac('sha256', "key").update("Bill0").digest("hex");
                    InsertInvestitor("'Bill','Gates','bill@outlook.com','"+pswHashed+"','0x6192c2D89cc95764420b26d36861340Dd143177C','EFAE13F5314A5CC7B643FE021F97DF55C1428CEC6C34BE5E4C0A5EDEB2F3C53C'");
                    
                    //insert Jeff Bezos
                    pswHashed = crypto.createHmac('sha256', "key").update("Jeff0").digest("hex");
                    InsertInvestitor("'Jeff','Bezos','elon@tesla','"+pswHashed+"','0x621d58Ed97F126d5DF7c55f951eaea87e888AFf1','8BD9C9A7EDD01D4562645EA422CD260CA086BF7664C5F4F0BA1497DE2B80238D'");
                    return;
                }
            });
        });
    })
}); 

//server methods
router.post("/sign-in",function(req,res,next){
    interface.createWallet().then(result => {
        //create hash of password
        let pswHashed = crypto.createHmac('sha256', "key").update(req.body["password"]).digest("hex");
        //create command
        let str = "'" + req.body["name"] + "','" + req.body["surname"] + "','" +req.body["mail"].replace("@","-") + "','" +pswHashed+"','"+result["address"] + "','"+result["key"] + "'";
        console.log(result['key']);
        let sql = "INSERT INTO accounts(name,surname,mail,password,address,privatekey) VALUES("+str+")";
        //send command
        con.query(sql,(err) => {
            if(err){
                res.send(err);
                return;
            }
            //send log
            res.send("SIGN-IN PERFORMED SUCCESSFULLY, NOW LOGIN!");
        });  
    });
});

router.post("/login",function(req,res,next){
    //create hash of password
    let pswHashed = crypto.createHmac('sha256', "key").update(req.body["password"]).digest("hex");
    //create command
    let sql = "SELECT name,password,address,privatekey FROM accounts WHERE name = '"+req.body["name"]+"' AND password = '"+pswHashed +"'";
    //send command
    con.query(sql,(err,result) => {
        if(err){
            res.send(err);
            return;
        }
        //check if there are element in database like data given
        if(result[0] === undefined){ 
            res.send("Nome utente o Password non corretti!");
            return;
        }
        //send address and privateKey
        console.log(result[0].privatekey.substring(2,result[0].privatekey.length));
        res.send(result[0].address + " " + result[0].privatekey.substring(2,result[0].privatekey.length));
    });
});
//get account info like dollars or token balance
router.post("/info",function(req,res,next){
    interface.getInfo(req.body["address"]).then(result =>{
        res.send(result["dollars"].toString() + " " + result["tokens"].toString());
    });
});
//add dollars to account
router.post("/addDollars",async function(req,res,next){
    const hash = await interface.addDollars(req.body["hash"],Number(req.body["dollars"]),req.body["address"],req.body["key"]);
    res.send(hash);
});
//get all other information
router.post("/getAll",function(req,res,next){
    interface.getAll().then(result =>{
        result = JSON.stringify(result);
        res.send(result);
    })
});
//sell a offer
router.post("/sell",async function(req,res,next){
    const hash = await interface.sell(req.body["hash"],Number(req.body["tokens"]) , Number(req.body["price"]) ,req.body["address"],req.body["key"]);
    res.send(hash);
});
//buy a offer
router.post("/buy",async function(req,res,next){
    const hash = await interface.buy(req.body["hash"],Number(req.body["id"]),req.body["address"],req.body["key"]);
    res.send(hash);
});
module.exports = router;