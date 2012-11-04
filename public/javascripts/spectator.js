$(function() {

  $.deck('.slide');
  $.deck('go', session.get('slide'));

  // disallow deck controls for spectators
  $d = $(document);
  $d.unbind('keydown.deck');
  $d.unbind('touchstart.deck');
  $d.unbind('touchmove.deck');
  $d.unbind('touchend.deck');

  var socket = io.connect('/spectator');
  socket.on('slide.change', function(data) {
    $.deck('go', data.to);
  });

});
