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
  force: true,
  debug: true,
  src: assets_path,
  compile: function(str, path, fn) {
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

// helper
app.locals.timeago = require('timeago');

// ####################
// ## Globals #########
// ####################

global._ = require('underscore');
global.Backbone = require('backbone');
global.RemoteDecks = {};
global.RemoteDecks.Session = require(__dirname + '/shared/models/session').Session;
global.RemoteDecks.Sessions = require(__dirname + '/shared/collections/sessions').Sessions;

global.helper = {};
var _uniqueIdCounter = { 'global': 0 }
global.helper.uniqueId = function(key) {
  key = (typeof key === 'string' ? key : 'global');

  if(!_uniqueIdCounter.hasOwnProperty(key)) {
    _uniqueIdCounter[key] = 0;
  }
  
  return _uniqueIdCounter[key] += 1;
}


// ####################
// ## Data ############
// ####################

var Backbone = require('backbone');
// we don't persist data
Backbone.sync = function(method, model, options) {
  return true;
}

global.sessions = new global.RemoteDecks.Sessions();


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
  
  socket.on('slide.change', function(data) {
    var session = global.sessions.get(data.session_id);
    session.set('slide', data.to);
    io.of('/spectator').emit('slide.change', data);
  });

});

io.of('/spectator').on('connection', function(socket) {

});




// ####################
// ## Routes ##########
// ####################

app.get('/', function(req, res) {
  var sessions = global.sessions;
  res.render('index', {
    title: app.get('title'),
    layout: 'layout',
    sessions: sessions
  })
});


// sessions
app.get('/sessions/new', function(req, res) {
  // create new session
  var session = global.sessions.create({});
  res.redirect('/sessions/' + session.id);
});


app.get('/sessions/:session_id', function(req, res) {
  var session = global.sessions.get(req.params.session_id);
  if(session) {
    res.render('session/spectator', {
      title: app.get('title'),
      layout: 'session/layout',
      session: session
    });
  } else {
    res.redirect('/sessions/new');
  }
});


app.get('/sessions/:id/speaker', function(req, res) {
  var session = sessions.get(req.params.id);
  if(session) {
    res.render('session/speaker', {
      title: 'Speaker - ' + app.get('title'),
      layout: 'session/layout',
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
