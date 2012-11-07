$(function() {

  var EM = window.EventManager,
      DM = window.DeckManager,
      session = window.session,
      spectator = window.spectator,
      socket = io.connect(),
      SM = new SpectatorSocketManager(socket, session, spectator);

  // spectators can not controls the slides
  DM.disableControls();

  socket.on('connect', function() {
    // join as speaker
    SM.join();
  });

  socket.on('disconnect', function() {
    // TODO: NOTIFY USER
  });


  SM.on('join.success', function() {
    // connect general socket manager
    new SocketManager(socket); 
  });

  EM.on('slide.change', function(data) {
    DM.goto(data.to);
  });

});


window.SpectatorSocketManager = function(socket, session, spectator) {
  this.socket = socket;
  this.session = session;
  this.spectator = spectator;

  _.extend(this, Backbone.Events);

  var self = this;
  _.each(['join.success', 'join.failure'], function(ev) {
    socket.on(ev, function(data) {
      self.trigger(ev);
    });
  });
};

window.SpectatorSocketManager.prototype = {

  // SEND JOIN REQUEST TO SERVER
  join: function(session) {

    this.socket.emit('join.spectator', {
      session_id: this.session.get('id'),
      spectator_id: this.spectator.get('id')
    });

  }

}
