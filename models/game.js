var mongoose = require('mongoose');
var gameSchema = new mongoose.Schema({
  name: String,
  phone: String
});
var Game = mongoose.model('game', gameSchema);
module.exports = Game;
