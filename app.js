var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.render('index.ejs');
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});