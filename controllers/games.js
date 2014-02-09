var mongoose = require('mongoose');
var games = require('../routes/games');
var Game = require('../models/game');
module.exports.controller = function(app) {

  /**
   * GET /games - fetch a list of games
   */
  app.get('/games', function(req, res) {
    Game.find(function(err, games) {
      if (err) {
        res.send({error: 'Error in listing games'});
      } else {
        res.send(games);
      }
    });
  });

  /**
   * GET /games/:name - fetch a unique game
   */
  app.get('/games/:name', function(req, res) {
    Game.find({name: req.params.name}, function(err, game) {
      if (err || game.length != 1) {
        res.send({error: 'Error in finding unique game: ' + req.params.name});
      } else {
        res.send(game[0]);
      }
    });
  });
  
  /**
   * POST /games - create a new game
   */
  //app.post('/games', games.create);
  
  /**
   * PUT /games/:id - update a game
   */
  //app.put('/games/:id', games.update);

  /**
   * DELETE /games/:id - delete a game
   */
  //app.delete('/games/:id', games.delete);

  
};
