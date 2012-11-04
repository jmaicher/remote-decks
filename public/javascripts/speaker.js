$(function() {

  $.deck('.slide');
  $.deck('go', session.get('slide'));

  var socket = io.connect('/speaker');
  
  $(document).on('deck.change', function(event, from, to) {
    socket.emit('slide.change', { session_id: session.get('id'), from: from, to: to });
  });

});
