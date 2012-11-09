$(function() {

  // quick workaround to identify spectator
  $('body').addClass('spectator');

  var EM = window.EventManager,
      DM = window.DeckManager,
      session = window.session,
      spectator = window.spectator,
      socket = io.connect(),
      SM = new SpectatorSocketManager(socket, session, spectator);

  // disable video controls
  $('video').on('click touchstart', function(e) {
    e.preventDefault();
  });

  SM.on('video.play', function() {
    $('.deck-current video').get(0).play();
  });

  SM.on('video.pause', function() {
    $('.deck-current video').get(0).pause();
  });

  // spectators can not controls the slides
  DM.disableControls();

  socket.on('connect', function() {
    EM.trigger('connection.pending')
    // join as speaker
    SM.join();
  });

  socket.on('disconnect', function() {
    // TODO: NOTIFY USER
    EM.trigger('disconnect');
    // remove spectator from connected spectators
    session.spectators.remove(spectator);
  });

  SM.on('join.success', function() {
    // connect general socket manager
    new SocketManager(socket); 
    EM.trigger('connection.success');
    // add spectator to connected specatators collection
    session.spectators.add(spectator);
  });

  SM.on('join.failure', function(data) {
    // TODO: Notify user
    console.log(data);
    EM.trigger('connection.failure');
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
  _.each(['join.success', 'join.failure', 'video.play', 'video.pause'], function(ev) {
    socket.on(ev, function(data) {
      self.trigger(ev);
      console.log(ev);
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
