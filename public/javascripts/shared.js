$(function() {

  var socket = io.connect('http://localhost:3000');

  socket.on('server-news', function(data) {
    console.log(data.i);
    socket.emit('client-news', { i: data.i + 1 });
  });

});
