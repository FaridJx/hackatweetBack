var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");
const Trends = require("../models/trends");
const { checkBody } = require("../modules/checkbody");

router.get("/", function (req, res, next) {
  Tweet.find()
    .populate("user likedBy")
    .then((data) => {
      res.json(data);
    });
});

router.post("/newTweet/:token", async function (req, res, next) {
  if (!checkBody(req.body, ["message"])) {
    res.json({ result: false, error: "Vous devez écrire" });
    return;
  }
  const theUser = req.params.token;
  const message = req.body.message;
  await User.findOne({ token: theUser }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Vous ne pouvez pas publier de tweet" });
      return;
    }

    if (message.length === 0) {
      res.json({ result: false, error: "N'hésite pas à écrire ton tweet" });
      return;
    }

    if (message.length > 280) {
      res.json({
        result: false,
        error: "Le tweet ne peut pas dépasser 280 caractères",
      });
      return;
    }

    const newTweet = new Tweet({
      message: message,
      date: new Date(),
      user: data._id,
      likedBy: [],
    });

    newTweet.save().then((e) => {
      Tweet.findById(e._id).then((data) => {
        res.json({ result: true, data });
      });
    });
  });
});

// Ajouter un like
router.put("/like/:token", async (req, res) => {
  const user = await User.findOne({ token: req.params.token });

  const tweet = await Tweet.findOne({ _id: req.body.tweet }).populate(
    "likedBy"
  );

  const hasLiked = tweet.likedBy.some(
    (u) => u._id.toString() === user._id.toString()
  );

  if (hasLiked) {
    tweet.likedBy = tweet.likedBy.filter(
      (u) => u._id.toString() !== user._id.toString()
    );
    const savedTweet = await tweet.save();
    user.likedTweets = user.likedTweets.filter(
      (e) => e.toString() !== tweet._id.toString()
    );
    const savedUser = await user.save();
    res.json({
      result: true,
      likedBy: savedTweet.likedBy,
      likedTweet: savedUser.likedTweets,
    });
  } else {
    tweet.likedBy.push(user._id);
    const savedTweet = await tweet.save();
    user.likedTweets.push(savedTweet._id);
    const savedUser = await user.save();
    res.json({
      result: true,
      likedBy: savedTweet.likedBy,
      likedTweet: savedUser.likedTweets,
    });
  }
});

router.delete("/delete/:tweetId", async (req, res) => {
  const tweetId = req.params.tweetId;
  const allTrends = await Trends.find();

  // Effectuez la logique de suppression ici
  await Tweet.findOne({ _id: tweetId }).then((tweet) => {
    if (!tweet) {
      // Le tweet n'a pas été trouvé, renvoyez une réponse d'erreur
      return res
        .status(404)
        .json({ result: false, message: "Tweet non trouvé" });
    }

    for (let i = 0; i < allTrends.length; i++) {
      const hashtag = allTrends[i].hashtag;

      if (tweet.message.includes(hashtag)) {
        Trends.deleteOne({ hashtag: hashtag }).then(() => {
          Trends.find().then((data) => {
          });
        });
        break
      }
    }

    // supprimer le tweet
    tweet.deleteOne().then(() => {
      // Le tweet a été supprimé avec succès, renvoyez une réponse de réussite
      res.json({ result: true, message: "Tweet supprimé avec succès" });
    });
  });
});

module.exports = router;
