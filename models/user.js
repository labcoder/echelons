var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, trim: true, index: {unique: true}},
  fullName: {type: String, trim: true},
  phone: String,
  elos: mongoose.Schema.Types.Mixed
});

var User = mongoose.model('user', userSchema);
module.exports = User;
