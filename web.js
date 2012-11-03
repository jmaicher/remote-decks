var express = require('express'),
    io = require('socket.io'),
    stylus = require('stylus'),
    http = require('http');


// ###########################
// ## Setup & Configuration ##
// ###########################

var app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 3000;

app.set('title', 'Awesome remote decks are awesome!');

// assets
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
app.set('view options', { layout: false });

// logging
app.use(express.logger());


// ####################
// ## Socket.io #######
// ####################

var io = io.listen(server);

// settings for heroku
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

var i = 1;

io.of('/global').on('connection', function(socket) {

  socket.emit('server-news', { i: i });
  
  socket.on('client-news', function(data) {
    i = data.i;
    console.log(i);
  });

});


// ####################
// ## Routes ##########
// ####################

app.get('/', function(req, res) {
  res.render('presentation', {
    title: app.get('title'),
    layout: 'presentation/layout'
  });
});

app.get('/presenter', function(req, res) {
  res.render('presenter', {
    title: 'Presenter - ' + app.get('title'),
    layout: 'presenter/layout'
  });
});


// ######################
// ## Run kitten, run ###
// ######################

server.listen(port, function() {
  console.log('Listening on ' + port);
});
