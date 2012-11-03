$(function() {

  $.deck('.slide');

  var socket = io.connect('/presenter');
  
  $(document).on('deck.change', function(event, from, to) {
    socket.emit('deck.change', { from: from, to: to });
  });

});
