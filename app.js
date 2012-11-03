var express = require('express'),
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
// shared modules
var shared_modules_path = __dirname + '/shared';
app.use('/shared', express.static(shared_modules_path));

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
// ## Data ############
// ####################

var Backbone = require('backbone');
// we don't persist data
Backbone.sync = function(method, model, options) {
  return true;
}

var Sessions = require(__dirname + '/shared/collections/sessions').Sessions;

var sessions = new Sessions();


// ####################
// ## Socket.io #######
// ####################

var io = require('socket.io').listen(server);

// settings for heroku
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

io.of('/global').on('connection', function(socket) {

});

io.of('/speaker').on('connection', function(socket) {
  
  socket.on('deck.change', function(data) {
    io.of('/spectator').emit('deck.change', data);
  });

});

io.of('/spectator').on('connection', function(socket) {

});




// ####################
// ## Routes ##########
// ####################

app.get('/', function(req, res) {
  res.send('Hello World');
});


// sessions
app.get('/sessions/new', function(req, res) {
  // create new session
  var session = sessions.create({});
  res.redirect('/sessions/' + session.id);
});


app.get('/sessions/:session_id', function(req, res) {
  var session = sessions.get(req.params.session_id);
  if(session) {
    res.render('spectator', {
      title: app.get('title'),
      layout: 'spectator/layout',
      session: session
    });
  } else {
    res.redirect('/');
  }
});


app.get('/sessions/:id/speaker', function(req, res) {
  var session = sessions.get(req.params.id);
  if(session) {
    res.render('speaker', {
      title: 'Speaker - ' + app.get('title'),
      layout: 'speaker/layout',
      session: session
    });
  } else {
    res.send('Session "' + req.params.id + '" not found');
  }
});


// ######################
// ## Run kitten, run ###
// ######################

server.listen(port, function() {
  console.log('Listening on ' + port);
});
