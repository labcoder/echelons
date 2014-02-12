# Echelons

A simple elo ranking application.
Right now, I'm building an API for this. Eventually I will add a UI.

There are a few different nouns:

+ [Games](#games)
+ [Users](#users)
+ [Matches](#matches)
+ [Matchups](#matchups)

### Games

A game can be something like "Ping Pong" or "Pool."
Games have an associated phone number to them which you can then text with the
statistics of the game, i.e. "I won against eric" or something like that.

### Users

Users have identities and elo rankings for the different games they play.

### Matches

A match is an instance of a game played by two (or more) users.

### Matchups

A matchup is a comparison between two users on a game

## To-do

+ Make a UI for this
+ Finish twilio integration
+ Handle users who text into the app, but are not yet registered in the system
+ Figure out how to handle "doubles" games in a fair way.
