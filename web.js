var express = require('express'),
    http = require('http');

// ###########################
// ## Setup & Configuration ##
// ###########################

var app = express();


// ####################
// ## Routes ##########
// ####################

app.get('/', function(req, res) {
  res.send('Hello World');
});


// ######################
// ## Run kitten, run ###
// ######################


var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function() {
  console.log('Listening on ' + port);
});
