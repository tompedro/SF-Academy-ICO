var express = require("express");
var interface = require("../contract");

var router = express.Router();

router.get("/", function(req, res, next) {
    res.send("API is working properly");
});
router.post("/sign-in",function(req,res,next){
    //console.log("create ...");
    interface.createWallet().then(result => {
        res.send(result);
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