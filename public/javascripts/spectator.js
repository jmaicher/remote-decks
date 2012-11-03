$(function() {

  $.deck('.slide');

  var socket = io.connect('/spectator');

  socket.on('deck.change', function(data) {
    $.deck('go', data.to);
  });

});
