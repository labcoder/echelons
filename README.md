# Echelons

A simple elo ranking application. This sets up the api and general framework,
for a UI to use this with, checkout out [echelons-ui](https://github.com/labcoder/echelons-ui)

There are a few different nouns:

+ [Games](#games)
+ [Users](#users)
+ [Matches](#matches)

### Games

A game can be something like "Ping Pong" or "Pool."
Games have an associated phone number to them which you can then [text](#phones)
with the statistics of the game.

### Users

Users have identities and elo rankings for the different games they play.
Users can signup by [texting the game's number](#phones) and then keep track
of records that way.

### Matches

A match is an instance of a game played by two (or more) users. They can keep
track of the scores and matchups between two players.

### Phones

There is a part of this api which I've built on top of [twilio](http://twilio.com).
You can find the code for this in [front.js](controllers/front.js). What this
controller does is handle three use cases (backeted parameters are optional):

+ Registering a new user - `register, FULL NAME {, desired-username}`
+ Winning a match - `win, opponent-username {, winning-score, losing-score}`
+ Losing a match - `lose, opponent-username {, winning-score, losing-score}`

#### Registration

I have never used echelons before and would like to register, I would then send
a text message to `+15552223344` (the phone number associated with one of the
games) with the following body: `register, Oscar Sanchez`

If I'm the first `Oscar` to join, my username will be `oscar`, otherwise, I would
be told someone else already has that username, and I would have to pick my own
username by sending something like the following:
`register, Oscar Sanchez, racso`, making `racso` my username from now on.
When a user is registered, the associated phone number is also stored, making it
easy to then send matches.

#### Winning/Losing a Match

Every game should have a phone number which is configured in twilio to webhook
to this file. For example, let's say I have a game which looks like this in my
collection:

```js
{
    name: "ping-pong",
    friendlyName: "Ping Pong",
    phone: "+15552223344"
}
```

For this example, let us say I defeated someone named "Doug" at ping pong, 21-0.
I would send a text message to `+15552223344` with `win, doug, 21, 0`.
This match will be recorded and elo scores would be updated, etc, etc. This
example assumed that Doug has username `doug`. What if he hasn't actually registered?
That's ok. As long as no one has the username you've entered, a new user will be
created with an empty phone number. This will allow Doug to register himself
with that username and he will then get all the matches propogated to him, including
elo rankings.

### Running Locally

1. This is a node app, so make sure you have node and npm
1. This runs on a mongodb instance, so you'll need to set up mongodb locally as well
1. `npm install` for the rest of the packages (I'd recommend also getting `npm install -g express` so it's global)
1. Make sure you have the following environment variables set up:
    + TWILIO_ACCOUNT_SID - The account sid that owns the numbers you'll be texting to/from
    + TWILIO_AUTH_TOKEN - The auth token for the account that owns the numbers you'll be texting to/from
    + ECHELONS_BASIC_AUTH_USER - The username that echelons will be performing basic auth against
    + ECHELONS_BASIC_AUTH_PASS - The password that echelons will be performing basic auth against
    + MONGOLAB_URI - The location of the database you're persisting to. If this is empty/not found, then echelons will default to the mongodb port running locally. If there is none, then it will break.
1. `node app` to see it go

## To-do

+ Figure out how to handle "doubles" games in a fair way.
