// Dependencies
var express = require('express');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var elo = require('elo-rank');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();

// Database
var mongoose = require('mongoose');
var mongoUri = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/echelons';
mongoose.connect(mongoUri, function(err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + mongoUri + '.\nMessage: ' + err);
  } else {
    console.log('Successfully connected to: ' + mongoUri);
  }
});

// Setup
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Load controllers
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
    route = require('./controllers/' + file);
    route.controller(app);
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
