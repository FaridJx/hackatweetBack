var express = require("express");
var router = express.Router();
const Trend = require("../models/trends");

/* GET users listing. */
router.get("/", function (req, res, next) {
    Trend.find().then(data => {
        res.json(data)
    })
});

router.post("/new", function (req, res, next) {

    const newTrend = new Trend({
        hashtag : req.body.hashtag
    })

    newTrend.save().then(data => {
        res.json({result: true, newTrend: data})
    })
})



module.exports = router;
