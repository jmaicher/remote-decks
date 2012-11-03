var express = require('express'),
    stylus = require('stylus'),
    http = require('http');


// ###########################
// ## Setup & Configuration ##
// ###########################

var app = express();

// serve static assets
var assets_path = __dirname + '/public';
app.use(express.static(assets_path));
// use stylus for stylesheets
app.use(stylus.middleware({
  debug: true,
  src: assets_path,
  compile: function(str, path) {
    return stylus(str)
      .set('filename', path)
  }
}));

// rendering
var view_path = __dirname + '/views';
app.set('views', view_path);
app.set('view engine', 'jade');

// logging
app.use(express.logger());


// ####################
// ## Routes ##########
// ####################

app.get('/', function(req, res) {
  res.render('index');
});


// ######################
// ## Run kitten, run ###
// ######################

var port = process.env.PORT || 3000;
http.createServer(app).listen(port, function() {
  console.log('Listening on ' + port);
});
