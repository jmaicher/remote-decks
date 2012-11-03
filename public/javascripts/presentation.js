$(function() {

  $.deck('.slide');

  var socket = io.connect('/presentation');

  socket.on('deck.change', function(data) {
    $.deck('go', data.to);
  });

});
