exports.init = (function(sessions, io) {

  var SessionRoomManagement = {

    join: function(joinRequest) {
      var user;

      if(joinRequest.isValid()) {
        Helper._add_to_session_room(joinRequest);
        
        if(joinRequest instanceof this.SessionRoomSpeakerJoinRequest) {
          Helper._add_to_session_speaker_room(joinRequest);
          user = { 'type': 'speaker' };
        } else {
          user = { 'type': 'spectator' };
        }
        
        joinRequest.socket.emit('join.success', { you: user });
        return true;
      } else {
        joinRequest.socket.emit('join.failure', { errors: joinRequest.errors });
        return false;
      }
    },

    getRoomName: function(session) {
      return Helper._session_room_name(session);
    }

  };

  SessionRoomManagement.SessionRoomJoinRequest = function(socket, reqData) { 
    // find session in global sessions collection
    this.session = sessions.get(reqData.session_id);
    this.socket = socket;
    this.errors = [];
  };

  SessionRoomManagement.SessionRoomJoinRequest.prototype.validate = function() {
    if(!this.session) {
      this.errors.push('session_id is invalid');
    }
  };

  SessionRoomManagement.SessionRoomJoinRequest.prototype.isValid = function() {
    this.validate(); 
    // for now, a join request must only have a valid session id
    return this.errors.length === 0;
  };

  // for now, join requests for speaker are equal to regular requests
  SessionRoomManagement.SessionRoomSpeakerJoinRequest = function(socket, reqData) {
    SessionRoomManagement.SessionRoomJoinRequest.apply(this, arguments);  
  };

  SessionRoomManagement.SessionRoomSpeakerJoinRequest.prototype = Object.create(SessionRoomManagement.SessionRoomJoinRequest.prototype);

  var Helper = {

    _add_to_session_room: function(joinRequest) {
      this._add_to_room(joinRequest.socket, this._session_room_name(joinRequest.session));
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

    _session_speaker_room_name: function(session) {
      return session.get('id') + '_speaker';
    }
   
  };

  return SessionRoomManagement;

});
