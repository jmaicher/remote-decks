$(function() {

  $.deck('.slide');
  $.deck('go', session.get('slide'));

  var socket = io.connect();
  socket.on('connect', function() {

    socket.on('join.success', function(data) {
      console.log(data);
      $(document).on('deck.change', slideChange);
    });

    socket.on('join.failure', function(data) {
      console.log(data);
    });

    socket.emit('join.speaker', { session_id: session.get('id') });

  });

  socket.on('slide.change', function(data) {
    $(document).off('deck.change', slideChange);
    $.deck('go', data.to);
    $(document).on('deck.change', slideChange);
  });

  socket.on('disconnect', function() {
    console.log('Oh boy, that is not good!');
  });

  var slideChange = function(event, from, to) {
    socket.emit('slide.change', { session_id: session.get('id'), from: from, to: to });
  }

});
