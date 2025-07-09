const mongoose = require("mongoose");

const trendSchema = mongoose.Schema({
  hashtag: String,
  counter: Number
});

const Trend = mongoose.model("trends", trendSchema);

module.exports = Trend;
