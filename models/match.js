var mongoose = require('mongoose');
var matchSchema = new mongoose.Schema({
  game: {type: String, lowercase: true, trim: true, index: true},
  winnerUsername: {type: String, lowercase: true, trim: true, index: true},
  loserUsername: {type: String, lowercase: true, trim: true, index: true},
  winnerScore: Number,
  loserScore: Number,
  date: { type: Date, default: Date.now }
});

var Match = mongoose.model('match', matchSchema);
module.exports = Match;
