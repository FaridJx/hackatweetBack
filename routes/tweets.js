var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweets");
const User = require("../models/users");
const { checkBody } = require("../modules/checkbody");


router.get("/", function (req, res, next) {
  Tweet.find().populate("user likedBy").then(data => {
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


// Ajouter un like
router.put('/like/:token', async (req, res) => {
  const user = await User.findOne({ token: req.params.token })
    // if (user.likedtweets.length === 5) {
    //   res.json({ result: false, error: 'Vous avez utilisé tous vos likes' })
    //   return
    // }

  const tweet = await Tweet.findOne({_id: req.body.tweet }).populate("likedBy")
  

      // if (tweet.likedBy.length >= 5) {
      //   res.json({ result: false, error: 'Cet objet a déjà eu le nombre maximum de likes' })
      //   return;
      // }

    const hasLiked = tweet.likedBy.some(u => u._id.toString() === user._id.toString());

    if (hasLiked) {
      tweet.likedBy = tweet.likedBy.filter(u => u._id.toString() !== user._id.toString());
      const savedTweet = await tweet.save();
      user.likedTweets = user.likedTweets.filter(e=> e.toString()!== tweet._id.toString());
      const savedUser = user.save()
      res.json({ result: true, likedBy: savedTweet.likedBy, likedTweet:savedUser.likedTweets});
      
    } else {
      tweet.likedBy.push(user._id);
      const savedTweet = await tweet.save();
      user.likedTweets.push(savedTweet._id)
      user.save()
      res.json({ result: true, likedBy: tweet.likedBy});
    }


    // const savedTweet = await tweet.save();
    
    // const populatedTweet = await Tweet.findById(savedTweet._id).populate('likedBy');
    
      // res.json({ result: true, likedBy: populatedTweet.likedBy});

        // user.likedtweets.push(savedtweet._id)
        // user.save().then(savedUser => {
        //   res.json({ result: true, likedBy: savedTweet.likedBy })
        // })
    
  
})




// router.put('/dislike/:token', (req, res) => {
//   User.findOne({ token: req.params.token }).then(user => {

//     // Si il n'y a pas d'objet on continue pas
//     Tweet.findOne({ _id: req.body.tweet }).then(tweet => {
//       if (!tweet) {
//         res.json({ result: false, error: 'tweet not found' })
//         return;
//       }
//     // la route doit recevoir le token du Donneur et pour modifier le document de l'item = le user à retirer du likedBy et l'item 

//       // Supprime l'ID de l'utilisateur de la liste "likedBy" de l'objet.
//       tweet.likedBy = tweet.likedBy.filter(e => e.toString() !== user.id.toString());

//       // ça va sauvegarder l'objet mis à jour.
//       tweet.save().then(savedtweet => {
//         // Supprime l'ID de l'objet de la liste "likedtweets" de l'utilisateur.
//         // On ajoute .toString() pour comparer les valeurs en string
//         // user.likedtweets = user.likedtweets.filter(e=> e.toString()!== tweet._id.toString());

//         // ça va sauvegarder l'utilisateur mis à jour.
//         user.save().then(savedUser => {
//           res.json({ result: true, likedBy: savedtweet.likedBy })
//         });
//       });
//     });
//   });
// });


module.exports = router;
