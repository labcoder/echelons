var mongoose = require('mongoose');
var User = require('../models/user');
module.exports.controller = function(app) {
  
  /**
   * GET /users - fetch a list of users
   */
  app.get('/users', function(req, res) {
    User.find(function(err, users) {
      return res.send(err ? err : users);
    });
  });

  /**
   * GET /users/:username - fetch a unique user
   */
  app.get('/users/:username', function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
      return res.send(err ? err : user);
    });
  });

  /**
   * POST /users - create a new user
   */
  app.post('/users', function(req, res) {
    if (!req.body.username) {
      return res.send({error: 'You need to have a username'});
    }

    var user = new User({
      username: req.body.username,
      fullName: req.body.fullName,
      phone: req.body.phone
    });

    user.save(function(err, user) {
      return res.send(err ? err : user);
    });
  });

  /**
   * PUT /users/:username - update a user
   */
  app.put('/users/:username', function(req, res) {
    User.findOneAndUpdate({username: req.params.username}, req.body, function(err, user) {
      return res.send(err ? err : user);
    });
  });

  /**
   * DELETE /users/:username - delete a user
   */
  app.delete('/users/:username', function(req, res) {
    User.findOneAndRemove({username: req.params.username}, function(err, user) {
      return res.send(err ? err : user);
    });
  });
};
