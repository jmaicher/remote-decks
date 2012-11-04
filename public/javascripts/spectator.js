$(function() {

  $.deck('.slide');
  $.deck('go', session.get('slide'));

  var socket = io.connect('/spectator');

  socket.on('slide.change', function(data) {
    $.deck('go', data.to);
  });

});
