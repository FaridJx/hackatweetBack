var express = require("express");
var router = express.Router();
const Trend = require("../models/trends");

/* GET users listing. */
router.get("/", function (req, res, next) {
    Trend.find().then(data => {
        res.json(data)
    })
});

router.post("/new", async (req, res, next) => {
    Trend.findOne({hashtag : req.body.hashtag}).then(async (data) => {
        if(data){
           await Trend.updateOne({hashtag : data.hashtag}, {$inc: {counter: 1}})
            res.json({result: true, trends: data})
        } else {
            const newTrend = new Trend({
                hashtag : req.body.hashtag,
                counter: 1
            })
        
            newTrend.save().then(data => {
                res.json({result: true, newTrend: data})
            })
        }
    })
})



module.exports = router;
