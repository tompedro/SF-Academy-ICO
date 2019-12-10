//import packages
var express = require("express");
var interface = require("../contract");
var mysql = require('mysql');
var router = express.Router();

//initialize connection with mysql database
var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"tokendb"
});

router.post("/sign-in",function(req,res,next){
    interface.createWallet().then(result => {
        //create command
        let str = "'" + req.body["name"] + "','" + req.body["surname"] + "','" +req.body["mail"].replace("@","-") + "','" +req.body["password"]+"','"+result["address"] + "','"+result["key"] + "'";
        let sql = "INSERT INTO accounts(name,surname,mail,password,address,primaryKey) VALUES("+str+")";
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
    //create command
    let sql = "SELECT name,password,address,primaryKey FROM accounts WHERE name = '"+req.body["name"]+"' AND password = '"+req.body["password"] +"'";
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
        //send address and privateKey (primaryKey)
        res.send(result[0].address + " " + result[0].primaryKey);
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