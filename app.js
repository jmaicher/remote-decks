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
      .set('filename', path);
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
global.RemoteDecks.Speaker = require(__dirname + '/shared/models/speaker').Speaker;
global.RemoteDecks.Speakers = require(__dirname + '/shared/collections/speakers').Speakers;
global.RemoteDecks.Spectator = require(__dirname + '/shared/models/spectator').Spectator;
global.RemoteDecks.Spectators = require(__dirname + '/shared/collections/spectators').Spectators;
global.RemoteDecks.Session = require(__dirname + '/shared/models/session').Session;
global.RemoteDecks.Sessions = require(__dirname + '/shared/collections/sessions').Sessions;

global.helper = {

  /**
   * Manage unique ids
   */
  _uniqueIdCounter: { 'global': 0 },

  uniqueId: function(key) {
    key = (typeof key === 'string' ? key : 'global');

    if(!this._uniqueIdCounter.hasOwnProperty(key)) {
      this._uniqueIdCounter[key] = 0;
    }
    
    return this._uniqueIdCounter[key] += 1;
  }

};

// ####################
// ## Data ############
// ####################

var Backbone = require('backbone');
// we don't persist data
Backbone.sync = function(method, model, options) {
  return true;
};

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


var SessionRoomManagement = require(__dirname + '/modules/session_room_management').init(global.sessions, io);

// TODO: Refactoring (Do I really need different namespaces for speakers and spectators?)
io.on('connection', function(socket) {

  socket.on('join.speaker', function(req) {
    var speakerJoinReq = new SessionRoomManagement.SpeakerJoinRequest(socket, req),
        session = speakerJoinReq.session,
        speaker = speakerJoinReq.speaker;

    // Refactoring: Let join return connection object?
    if(SessionRoomManagement.join(speakerJoinReq)) {
      // SPEAKER CONNECTED

      // allow slide change
      socket.on('slide.change', function(data) {
        session.set('slide', data.to);
        socket.broadcast.to(session.session_id).emit('slide.change', data);
      });
    
      socket.on('disconnect', function () {
        SessionRoomManagement.leave(socket, session, speaker);
      });

    }

  });

  socket.on('join.spectator', function(req) {
    var spectatorJoinReq = new SessionRoomManagement.SpectatorJoinRequest(socket, req),
        session = spectatorJoinReq.session,
        spectator = spectatorJoinReq.spectator;


    // Refactoring: Let join return connection object?
    if(SessionRoomManagement.join(spectatorJoinReq)) {
      // SPECTATOR CONNECTED 

      socket.on('disconnect', function () {
        SessionRoomManagement.leave(socket, session, spectator);
      });

    }
  });

});


// ####################
// ## Routes ##########
// ####################

app.get('/sessions/:session_id/spectators/new', function(req, res) {
  var session = global.sessions.get(req.params.session_id),
      spectator;

  if(session) {
    spectator = session.spectators.create(); 
    res.redirect('/sessions/' + session.get('id') + '/spectators/' + spectator.get('id'));
  } else {
    res.send('Session "' + req.params.session_id + '" not found');
  }

});


app.get('/sessions/:session_id/spectators/:id', function(req, res) {
  var session = global.sessions.get(req.params.session_id),
      spectator;

  if(session) {
    spectator = session.spectators.get(req.params.id);
    
    if(spectator) {
      res.render('session/spectator', {
        title: spectator.get('name') + ' - ' + app.get('title'),
        layout: 'session/layout',
        session: session,
        spectator: spectator
      });    
    } else {
      res.redirect('/sessions/' + session.get('id') + '/spectators/new')
    }

  } else {
    res.send('Session "' + req.params.session_id + '" not found');
  }

});


app.get('/sessions/:session_id/speakers/new', function(req, res) {
  var session = global.sessions.get(req.params.session_id),
      speaker;

  if(session) {
    speaker = session.speakers.create(); 
    res.redirect('/sessions/' + session.get('id') + '/speakers/' + speaker.get('id'));
  } else {
    res.send('Session "' + req.params.session_id + '" not found');
  }
});


app.get('/sessions/:session_id/speakers/:id', function(req, res) {
  var session = global.sessions.get(req.params.session_id),
      speaker;

  if(session) {
    speaker = session.speakers.get(req.params.id);
    
    if(speaker) {
      res.render('session/speaker', {
        title: speaker.get('name') + ' - ' + app.get('title'),
        layout: 'session/layout',
        session: session,
        speaker: speaker
      });    
    } else {
      res.redirect('/sessions/' + session.get('id') + '/speakers/new')
    }

  } else {
    // TODO: Change in production
    res.redirect('/sessions/new');
    // res.send('Session "' + req.params.session_id + '" not found');
  }
});


app.get('/sessions/new', function(req, res) {
  // create new session
  var session = global.sessions.create();
  res.redirect('/sessions/' + session.id + '/speakers/new');
});


app.get('/sessions/:id', function(req, res) {
  var session = global.sessions.get(req.params.session_id);
  if(session) {
    res.redirect('/sessions/' + session.get('id') + '/speakers/new');
  } else {
    res.send('Session "' + req.params.id + '" not found');
  }
});


app.get('/', function(req, res) {
  var sessions = global.sessions;
  res.render('index', {
    title: app.get('title'),
    layout: 'layout',
    sessions: sessions
  });
});


// ######################
// ## Run kitten, run ###
// ######################

server.listen(port, function() {
  console.log('Listening on ' + port);
});
