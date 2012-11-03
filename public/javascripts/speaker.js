$(function() {

  $.deck('.slide');

  var socket = io.connect('/speaker');
  
  $(document).on('deck.change', function(event, from, to) {
    socket.emit('deck.change', { from: from, to: to });
  });

});
