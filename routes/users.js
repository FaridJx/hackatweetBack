var express = require("express");
var router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkbody");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", function (req, res, next) {
  const hash = bcrypt.hashSync(req.body.password, 10);
  if (!checkBody(req.body, ["firstname", "username", "password"])) {
    res.json({ result: false, error: "Il manque des informations" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const newUser = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        password: hash,
        token: uid2(32),
        canTweet: true,
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, newDoc });
      });
    } else res.json({ result: false, error: "Ce compte existe déjà"});
  });
});

router.post("/signin", function (req, res, next) {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Il manque des informations" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, data });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

router.get("/canTweet/:token", (req, res) => {
  User.findOne({ token: req.params.token }).then((data) => {
    if (data) {
      res.json({ result: true, canTweet: data.canTweet });
    } else {
      res.json({ result: false, error: "User not found" });
    }
  });
});

module.exports = router;
