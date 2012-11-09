exports.init = (function(sessions, io) {

  var SessionRoomManagement = {

    join: function(joinRequest) {
      var actor;

      if(joinRequest.isValid()) {
        
        // actions specific to the actor type 
        if(joinRequest instanceof this.SpeakerJoinRequest) {
          actor = joinRequest.speaker;
          Helper._add_to_session_speaker_room(joinRequest);
          this.broadcast(joinRequest.socket, joinRequest.session, 'speaker.connected', actor);
        } else {
          actor = joinRequest.spectator;
          Helper._add_to_session_spectator_room(joinRequest);
          this.broadcast(joinRequest.socket, joinRequest.session, 'spectator.connected', actor);
        }

        // mark actor as connected
        actor.set('connected', true);
        Helper._add_to_session_room(joinRequest);
        
        joinRequest.socket.emit('join.success');
        return true;
      } else {
        joinRequest.socket.emit('join.failure', { errors: joinRequest.errors });
        return false;
      }
    },

    leave: function(socket, session, actor) {
      actor.set('connected', false);
      if(actor instanceof global.RemoteDecks.Speaker) {
        this.broadcast(socket, session, 'speaker.disconnected', actor);
      } else {
        this.broadcast(socket, session, 'spectator.disconnected', actor);
      }
    },

    broadcast: function(socket, session, message, data) {
      socket.broadcast.to(Helper._session_room_name(session)).emit(message, data);
    },

    send_spectators: function(socket, session, message, data) {
      io.sockets.in(Helper._session_spectator_room_name(session)).emit(message, data);
    }

  };


  SessionRoomManagement.JoinRequest = function(socket, reqData) {
    this.session = sessions.get(reqData.session_id);
    this.socket = socket;
    this.errors = [];
  };

  SessionRoomManagement.JoinRequest.prototype.isValid = function() {
    this.validate(); 
    // for now, a join request must only have a valid session id
    return this.errors.length === 0;
  };

  SessionRoomManagement.JoinRequest.prototype.validate = function() {
    if(!this.session) {
      this.errors.push('session_id is invalid');
    }
  };


  SessionRoomManagement.SpectatorJoinRequest = function(socket, reqData) { 
    // call super ctor
    SessionRoomManagement.JoinRequest.apply(this, arguments);  
    // find session in global sessions collection
    this.spectator = this.session ?
      this.session.spectators.get(reqData.spectator_id) : undefined;
  };

  SessionRoomManagement.SpectatorJoinRequest.prototype =
    Object.create(SessionRoomManagement.JoinRequest.prototype);

  // overwrite validate method
  SessionRoomManagement.SpectatorJoinRequest.prototype.validate = function() {
    // call super
    SessionRoomManagement.JoinRequest.prototype.validate.apply(this);

    // when session is valid check spectator
    if(this.errors.length === 0 && ! this.spectator) {
      this.errors.push('spectator_id is invalid');
    }
  };

  SessionRoomManagement.SpeakerJoinRequest = function(socket, reqData) { 
    // call super ctor
    SessionRoomManagement.JoinRequest.apply(this, arguments);  
    // find session in global sessions collection
    this.speaker = this.session ?
      this.session.speakers.get(reqData.speaker_id) : undefined;
  };

  SessionRoomManagement.SpeakerJoinRequest.prototype =
    Object.create(SessionRoomManagement.JoinRequest.prototype);

  // overwrite validate method
  SessionRoomManagement.SpeakerJoinRequest.prototype.validate = function() {
    // call super
    SessionRoomManagement.JoinRequest.prototype.validate.apply(this);

    // when session is valid check speaker
    if(this.errors.length === 0 && ! this.speaker) {
      this.errors.push('speaker_id is invalid');
    }
  };


  // private module helper
  var Helper = {

    _add_to_session_room: function(joinRequest) {
      this._add_to_room(joinRequest.socket, this._session_room_name(joinRequest.session));
    },

    _add_to_session_spectator_room: function(joinRequest) {
      this._add_to_room(joinRequest.socket, this._session_spectator_room_name(joinRequest.session));
    },

    _add_to_session_speaker_room: function(joinRequest) {
      this._add_to_room(joinRequest.socket, this._session_speaker_room_name(joinRequest.session));
    },

    _add_to_room: function(socket, room_name) {
      socket.join(room_name);
    },

    _session_room_name: function(session) {
      return session.get('id');
    },

    _session_spectator_room_name: function(session) {
      return this._session_room_name(session) + '_spectator';
    },

    _session_speaker_room_name: function(session) {
      return this._session_room_name(session) + '_speaker';
    }
   
  };

  return SessionRoomManagement;

});
