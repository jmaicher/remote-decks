$(function() {

  var EM = window.EventManager,
      DM = window.DeckManager,
      session = window.session,
      speaker = window.speaker,
      socket = io.connect(),
      SM = new SpeakerSocketManager(socket, session, speaker);

  socket.on('connect', function() {
    EM.trigger('connection.pending')
    // join as speaker
    SM.join();
  });

  socket.on('disconnect', function() {
    // TODO: NOTIFY USER
    EM.trigger('connection.failure');
  });

  SM.on('join.success', function() {
    // connect general socket manager
    new SocketManager(socket);
    DM.on('deck.change', submitLocalSlideChange);
    EM.trigger('connection.success');
  });
    
  SM.on('join.failure', function(data) {
    // TODO: Notify user
    console.log(data);
    EM.trigger('connection.failure');
  });

  EM.on('slide.change', function(data) {
    // do not submit local slide change if triggered by server
    DM.off('deck.change', submitLocalSlideChange);
    DM.goto(data.to);
    DM.on('deck.change', submitLocalSlideChange);
  });

  var submitLocalSlideChange = function(data) {
    socket.emit('slide.change', {
      session_id: session.get('id'),
      from: data.from,
      to: data.to
    });
  }

});


window.SpeakerSocketManager = function(socket, session, speaker) {
  this.socket = socket;
  this.session = session;
  this.speaker = speaker;

  _.extend(this, Backbone.Events);

  var self = this;
  _.each(['join.success', 'join.failure'], function(ev) {
    socket.on(ev, function(data) {
      self.trigger(ev, data);
    });
  });
};

window.SpeakerSocketManager.prototype = {

  // SEND JOIN REQUEST TO SERVER
  join: function(session) {

    this.socket.emit('join.speaker', {
      session_id: this.session.get('id'),
      speaker_id: this.speaker.get('id')
    });

  }

}
