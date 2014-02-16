var mongoose = require('mongoose');
var Match = require('../models/match');
var User = require('../models/user');
var Game = require('../models/game');
var elo = require('elo-rank')(32);
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var defaultScore = 1000;

var sendMessage = function(to, from, message) {
  twilio.messages.create({
    to: to,
    from: from,
    body: message,
  }, function(err, message) {
    if (!err) {
      console.log(message.sid);
    }
  });
};

var createUser = function(userNumber, gameNumber, name, desiredUsername) {
  if (!name) {
    return sendMessage(userNumber, gameNumber, "Sorry, I need your name. Try again :]");
  }
  var username = name.split(' ')[0].trim().toLowerCase();
  if (desiredUsername) {
    username = desiredUsername.trim().toLowerCase();
  }

  User.findOne({ $or: [{phoneNumber: userNumber}, {username: username}]}, function(err, user) {
    if (err) {
      console.log("ERROR:\n");
      console.log(err);
      return sendMessage(userNumber, gameNumber, "Sorry, something went wrong. Try again");
    }

    if (user) {
      if (user.phone == userNumber) {
        return sendMessage(userNumber, gameNumber, "This phone number is already registered to: " + user.fullName);
      }

      if (!user.phone) { // we are assigning a number to this user for the first time
        user.phone = userNumber;

        user.save(function(err, user) {
          if (err) {
            return sendMessage(userNumber, gameNumber, "Sorry, could not create your account");
          }

          return sendMessage(userNumber, gameNumber, "Awesome. Your games will now be recorded with username: " + user.username);
        });
      } else {
        return sendMessage(userNumber, gameNumber, "The username: " + username + " is already registered to user: " + user.fullName);
      }
    } else {
      // Create new user
      var user = new User({
        username: username,
        fullName: name,
        phone: userNumber
      });

      user.save(function(err, user) {
        if (err) {
          return sendMessage(userNumber, gameNumber, "Sorry, something went wrong and I couldn't save your user");
        } else {
          return sendMessage(userNumber, gameNumber, "Cool. Your games can now be recorded");
        }
      });
    }
  });
}

var createMatch = function(outcome, userNumber, gameNumber, opponentName, score1, score2) {
  User.findOne({phone: userNumber}, function(err, user) {
    if (err) {
      console.log("ERROR:\n");
      console.log(err);
      return sendMessage(userNumber, gameNumber, "Sorry, something went wrong. Try again");
    }

    if (!user) {
      return sendMessage(userNumber, gameNumber, "Sorry, you must register as a user first!");
    }

    // create Match for a game
    Game.findOne({phone: gameNumber}, function(err, game) {
      if (err) {
        console.log("ERROR:\n");
        console.log(err);
        return sendMessage(userNumber, gameNumber, "Sorry, something went wrong. Try again");
      }

      if (!game) {
        return sendMessage(userNumber, gameNumber, "Sorry, this number is not yet attributed to a game.");
      }

      // Create match
      var match = new Match({
        game: game.name,
        winnerUsername: outcome == "win" ? user.username : opponentName,
        loserUsername: outcome == "win" ? opponentName : user.username
      });

      if (score1 && score2) {
        match.winnerScore = score1;
        match.loserScore = score2;
      }

      // Do elo stuff
      User.findOne({username: opponentName}, function(err, opponent) {
        if (opponent) {
          var userScore = (user.elos && user.elos[game.name]) ? user.elos[game.name] : defaultScore;
          var opponentScore = (opponent.elos && opponent.elos[game.name]) ? opponent.elos[game.name] : defaultScore;

          var expectedUserScore = elo.getExpected(userScore, opponentScore);
          var expectedOpponentScore = elo.getExpected(opponentScore, userScore);

          if (!user.elos) {
            user.elos = {};
          }
          user.elos[game.name] = elo.updateRating(expectedUserScore, outcome == "win" ? 1 : 0, userScore);
          user.markModified('elos');

          if (!opponent.elos) {
            opponent.elos = {};
          }
          opponent.elos[game.name] = elo.updateRating(expectedOpponentScore, outcome == "win" ? 0 : 1, opponentScore);
          opponent.markModified('elos');

          user.save(function(err, user) { return; });
          opponent.save(function(err, opponent) { return; });

        } else {
          var userScore = (user.elos && user.elos[game.name]) ? user.elos[game.name] : defaultScore;
          var opponentScore = defaultScore;

          var expectedUserScore = elo.getExpected(userScore, opponentScore);
          var expectedOpponentScore = elo.getExpected(opponentScore, userScore);

          if (!user.elos) {
            user.elos = {};
          }
          user.elos[game.name] = elo.updateRating(expectedUserScore, outcome == "win" ? 1 : 0, userScore);
          user.markModified('elos');
          user.save(function(err, user) { return; });

          var opponentElos = {};
          opponentElos[game.name] = elo.updateRating(expectedOpponentScore, outcome == "win" ? 0 : 1, opponentScore);
          var opponent = new User({
            username: opponentName,
            fullName: opponentName,
            elos: opponentElos
          });
          opponent.save(function(err, opponent) { return; });
        }
      });

      // Persist the match
      match.save(function(err, match) {
        if (err) {
          console.log("ERROR:\n");
          console.log(err);
          return sendMessage(userNumber, gameNumber, "Something went wrong when saving this match. Try again");
        }

        if (outcome == "win") {
          return sendMessage(userNumber, gameNumber, "Congrats on the win!");
        } else {
          return sendMessage(userNumber, gameNumber, "Sorry you lost. Keep at it!");
        }
      });
    });
  });
}

module.exports.controller = function(app) {
  /**
   * POST /front - Twilio call for a user
   */
  app.post('/front', function(req, res) {
    var userNumber = req.body.From;
    var gameNumber = req.body.To;
    var textArray = req.body.Body.split(',');
    for (var i = 0; i < textArray.length; i++) {
      textArray[i] = textArray[i].trim();
    }

    var command = textArray[0].toLowerCase();
    switch (command) {
      case "register": // new user registration. "register, name, {username}"
        createUser(userNumber, gameNumber, textArray[1], textArray[2]);
        break;
      case "win": // user has won a game "win, losername, {scoreWin, scoreLose}"
        createMatch('win', userNumber, gameNumber, textArray[1], textArray[2], textArray[3]);
        break;
      case "lose": // user has lost a game "lose, winnername, {scoreWin, scoreLose}"
        createMatch('lose', userNumber, gameNumber, textArray[1], textArray[2], textArray[3]);
      default: // unrecognized command
        sendMessage(userNumber, gameNumber, 'Sorry, I do not understand that command: ' + command + ". Try one of {register, win, lose, leaderboards}");
        break;
    }

    return res.send({});
  });
}
