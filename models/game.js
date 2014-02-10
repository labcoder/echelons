var mongoose = require('mongoose');
var gameSchema = new mongoose.Schema({
  name: {type: String, index: {unique: true}},
  friendlyName: String,
  phone: String
});
var Game = mongoose.model('game', gameSchema);
module.exports = Game;
