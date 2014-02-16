var mongoose = require('mongoose');
var User = require('../models/user');
var express = require('express');

module.exports.controller = function(app) {
  
  // HTTP basic auth - add to route functions to apply
  var auth = express.basicAuth(function(user, pass) {
    return (user == process.env.ECHELONS_BASIC_AUTH_USER &&
            pass == process.env.ECHELONS_BASIC_AUTH_PASS)
  }, 'Sorry, you need proper credentials to see this.');

  /**
   * GET /users - fetch a list of users
   */
  app.get('/users', auth, function(req, res) {
    User.find(function(err, users) {
      return res.send(err ? err : users);
    });
  });

  /**
   * GET /users/:username - fetch a unique user
   */
  app.get('/users/:username', auth, function(req, res) {
    User.findOne({username: req.params.username}, function(err, user) {
      return res.send(err ? err : user);
    });
  });

  /**
   * POST /users - create a new user
   */
  app.post('/users', auth, function(req, res) {
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
  app.put('/users/:username', auth, function(req, res) {
    User.findOneAndUpdate({username: req.params.username}, req.body, function(err, user) {
      return res.send(err ? err : user);
    });
  });

  /**
   * DELETE /users/:username - delete a user
   */
  app.delete('/users/:username', auth, function(req, res) {
    User.findOneAndRemove({username: req.params.username}, function(err, user) {
      return res.send(err ? err : user);
    });
  });
};
