var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");

router.get("/", function (req, res, next) {
  Tweet.find().populate("user").then(data => {
    res.json(data)
  })
})

router.post("/newTweet/:token", async function (req, res, next) {
  const theUser = req.params.token;
  await User.findOne({ token: theUser }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Vous ne pouvez pas publier de tweet" });
      return;
    }

    const newTweet =  new Tweet({
      message: req.body.message,
      date: new Date(),
      user: data._id,
    });

     newTweet.save().then((e) => {
       Tweet.findById(e._id)
        .then((data) => {
          res.json(data);
        });
    });
  });
});

module.exports = router;
