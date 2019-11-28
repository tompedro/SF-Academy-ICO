var express = require("express");
var interface = require("../contract");
var mysql = require('mysql');
var router = express.Router();

var con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"tokendb"
});

router.get("/", function(req, res, next) {
    res.send("API is working properly");
});
router.post("/sign-in",function(req,res,next){
    interface.createWallet().then(result => {
        con.connect((err) =>{
            if(err) throw err;
            console.log("Connection Done");
            let str = "'" + req.body["name"] + "','" + req.body["surname"] + "','" +req.body["mail"].replace("@","-") + "','" +req.body["password"]+"','"+result["address"] + "','"+result["key"] + "'";
            console.log("I'M INSTERTING " + str);
            let sql = "INSERT INTO accounts(name,surname,mail,password,address,primaryKey) VALUES("+str+")";
            con.query(sql,(err) => {
                if(err) throw err;
                console.log("ALL DONE");
            })
        });
        //res.send(result);
    });
});
router.post("/login",function(req,res,next){
    con.connect((err) =>{
        if(err) throw err;
        console.log("Connection Done");
        let str = "'" + req.body["name"] + "','" + req.body["password"] + "'";
        console.log("I'M SEARCHING FOR " + str);
        let sql = "SELECT name,password,address,primaryKey FROM accounts WHERE name = '"+req.body["name"]+"' AND password = '"+req.body["password"] +"'";
        con.query(sql,(err,result) => {
            if(err) throw err;
            console.log(result[0].address);
            res.send(result[0].address);
        })
    });
});
router.post("/info",function(req,res,next){
    //console.log(JSON.stringify(interface.getInfo(req.body["account"])));
    interface.getInfo(req.body["account"]).then(result =>{
        //console.log(result["dollars"].toString() + " " + result["tokens"].toString());
        res.send(result["dollars"].toString() + " " + result["tokens"].toString());
    });
});
router.post("/addDollars",function(req,res,next){
    //console.log(req.body["account"]);
    interface.addDollars(Number(req.body["dollars"]),req.body["account"]).then(result =>{
        console.log("result => " + result);
        //console.log(JSON.stringify(interface.getInfo(req.body["account"])));
    });
});

router.post("/getAll",function(req,res,next){
    interface.getAll().then(result =>{
        result = JSON.stringify(result);
        res.send(result);
    })
});

router.post("/sell",function(req,res,next){
    interface.sell(Number(req.body["tokens"]) , Number(req.body["price"]) ,req.body["account"]).then(console.log);
});

router.post("/buy",function(req,res,next){
    interface.buy(Number(req.body["id"]),req.body["account"]).then(console.log);
});
module.exports = router;