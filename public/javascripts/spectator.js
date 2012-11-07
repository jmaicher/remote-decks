$(function() {

  $.deck('.slide');
  $.deck('go', session.get('slide'));

  // disallow deck controls for spectators
  $d = $(document);
  $d.unbind('keydown.deck');
  $d.unbind('touchstart.deck');
  $d.unbind('touchmove.deck');
  $d.unbind('touchend.deck');

  var socket = io.connect();
  socket.on('connect', function() {

    socket.on('join.success', function(data) {
      console.log(data);
    });

    socket.on('join.failure', function(data) {
      console.log(data)
    });

    socket.emit('join.spectator', { session_id: session.get('id') });

  });

  socket.on('slide.change', function(data) {
    $.deck('go', data.to);
  });

  socket.on('disconnect', function() {
    console.log('Oh boy, that is not good!');
  });

});
