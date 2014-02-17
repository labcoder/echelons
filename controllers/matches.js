var mongoose = require('mongoose');
var Match = require('../models/match');
var User = require('../models/user');
var Game = require('../models/game');
var elo = require('elo-rank');
var defaultScore = 1000;
module.exports.controller = function(app) {

  /**
   * GET /matches - fetch all matches by date descending
   */
  app.get('/matches', function(req, res) {
    Match.find({}).sort({date: -1}).exec(function(err, matches) {
      return res.send(err ? err : matches);
    });
  });

  /**
   * GET /matches/:id - fetch a match by its mongodb id
   */
  app.get('/matches/:id', function(req, res) {
    Match.findById(req.params.id, function(err, match) {
      return res.send(err ? err : match);
    });
  });

  /**
   * GET /matches/games/:game - fetch a list of matches by game type
   */
  app.get('/matches/games/:game', function(req, res) {
    Match.find({game: req.params.game}, function(err, matches) {
      return res.send(err ? err : matches);
    });
  });

  /**
   * GET /matches/games/:game/:user - fetch a list of a particular game by user
   */
  app.get('/matches/games/:game/:user', function(req, res) {
    Match.find({game: req.params.game, $or: [{winnerUsername: req.params.user}, {loserUsername: req.params.user}]}, function(err, matches) {
      return res.send(err ? err : matches);
    });
  });

  /**
   * GET /matches/users/:user - fetch a list of matches a user has played
   */
  app.get('/matches/users/:user', function(req, res) {
    Match.find({$or: [{winnerUsername: req.params.user}, {loserUsername: req.params.user}]}, function(err, matches) {
      return res.send(err ? err : matches);
    });
  });

  /**
   * GET /matches/users/:user1/:user2 - fetch a list of matches between users
   */
  app.get('/matches/users/:user1/:user2', function(req, res) {
    Match.find({$or: [{winnerUsername: req.params.user1, loserUsername: req.params.user2}, {winnerUsername: req.params.user2, loserUsername: req.params.user1}]}, function(err, matches) {
      return res.send(err ? err : matches);
    });
  });

  /**
   * POST /matches - create a new match
   */
  app.post('/matches', function(req, res) {
    if (!req.body.game) {
      return res.send({error: 'You must specify what game this match is for'});
    }

    if (!req.body.winnerUsername) {
      return res.send({error: 'You must specify the username of the winner.'});
    }

    if (!req.body.loserUsername) {
      return res.send({error: 'You must specify the username of the loser.'});
    }

    var match = new Match({
      game: req.body.game,
      winnerUsername: req.body.winnerUsername,
      loserUsername: req.body.loserUsername,
    });

    if (req.body.winnerScore) {
      match.winnerScore = req.body.winnerScore;
    }
    if (req.body.loserScore) {
      match.loserScore = req.body.loserScore;
    }

    match.save(function(err, match) {
      return res.send(err ? err : match);
    });
  });
}
