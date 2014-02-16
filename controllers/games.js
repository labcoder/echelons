var mongoose = require('mongoose');
var Game = require('../models/game');
var express = require('express');

module.exports.controller = function(app) {

  // HTTP basic auth - add to route functions to apply
  var auth = express.basicAuth(function(user, pass) {
    return (user == process.env.ECHELONS_BASIC_AUTH_USER &&
            pass == process.env.ECHELONS_BASIC_AUTH_PASS)
  }, 'Sorry, you need proper credentials to see this.');

  /**
   * GET /games - fetch a list of games
   */
  app.get('/games', auth, function(req, res) {
    Game.find(function(err, games) {
      return res.send(err ? err : games);
    });
  });

  /**
   * GET /games/:name - fetch a unique game
   */
  app.get('/games/:name', auth, function(req, res) {
    Game.findOne({name: req.params.name}, function(err, game) {
      return res.send(err ? err : game);
    });
  });
  
  /**
   * POST /games - create a new game
   */
  app.post('/games', auth, function(req, res) {
    if (!req.body.friendlyName) {
      return res.send({error: 'You must enter a friendly name for this game.'});
    }

    var game = new Game({
      name: req.body.friendlyName.replace(/\s+/g, '-').replace(/[^a-zA-Z-]/g, '').toLowerCase(),
      friendlyName: req.body.friendlyName
    });

    if (req.body.phone) {
      game.phone = req.body.phone;
    }

    game.save(function(err, game) {
      return res.send(err ? err : game);
    });
  });
  
  /**
   * PUT /games/:name - update a game
   */
  app.put('/games/:name', auth, function(req, res) {
    Game.findOneAndUpdate({name: req.params.name}, req.body, function(err, game) {
      return res.send(err ? err : game);
    });
  });

  /**
   * DELETE /games/:name - delete a game
   */
  app.delete('/games/:name', auth, function(req, res) {
    Game.findOneAndRemove({name: req.params.name}, function(err, game) {
      return res.send(err ? err : game);
    });
  });
};
