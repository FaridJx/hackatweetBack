var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");
const { checkBody } = require("../modules/checkbody");


router.get("/", function (req, res, next) {
  Tweet.find().populate("user").then(data => {
    res.json(data)
  })
})

router.post("/newTweet/:token", async function (req, res, next) {
  if (!checkBody(req.body, ["message"])) {
    res.json({ result: false, error: "Vous devez écrire" });
    return;
  }
  const theUser = req.params.token;
  const message = req.body.message
  await User.findOne({ token: theUser }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Vous ne pouvez pas publier de tweet" });
      return;
    }

    if(message.length === 0){
      res.json({ result: false, error: "N'hésite pas à écrire ton tweet" });
      return;
    }

    if(message.length > 280){
      res.json({ result: false, error: "Le tweet ne peut pas dépasser 280 caractères" });
      return;
    }

    const newTweet =  new Tweet({
      message: message,
      date: new Date(),
      user: data._id,
    });

     newTweet.save().then((e) => {
       Tweet.findById(e._id)
        .then((data) => {
          res.json({result: true, data});
        });
    });
  });
});

module.exports = router;
