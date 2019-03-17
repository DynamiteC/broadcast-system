var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var helmet = require('helmet');
var fs = require('fs');
var connectedUsers = {};
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// Attach session
app.use(session);

// Share session with io sockets
io.use(sharedsession(session));
var creds = '';

var redis = require('redis');
var client = '';
var port = process.env.PORT || 5000;

// Express Middleware for serving static
// files and parsing the request body
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
//Enable Simple Security
app.use(helmet());
//SET Views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// Start the Server
http.listen(port, function () {
  console.log('Server Started. Listening on *:' + port);
});


// Store people in chatroom
var chatters = [];

// Store messages in chatroom
var chat_messages = [];
var private_messages = [];
fs.readFile('creds.json', 'utf-8', function (err, data) {
  if (err) throw err;
  creds = JSON.parse(data);
  client = redis.createClient('redis://' + creds.user + ':' + creds.password + '@' + creds.host + ':' + creds.port);
  // Redis Client Ready
  client.once('ready', function () {
    // Flush Redis DB
    client.flushdb();
    // Initialize Chatters
    client.get('chat_users', function (err, reply) {
      if (reply) {
        chatters = JSON.parse(reply);
      }
    });
    // Initialize Messages
    client.get('chat_app_messages', function (err, reply) {
      if (reply) {
        chat_messages = JSON.parse(reply);
      }
    });

    client.get('private_app_messages', function (err, reply) {
      if (reply) {
        private_messages = JSON.parse(reply);
      }
    });
  });
});

app.get('/', function (req, res) {
  res.render('index.ejs');
})

app.post('/join', function (req, res) {
  var username = req.body.username;
  if (chatters.indexOf(username) === -1) {
    chatters.push(username);
    client.set('chat_users', JSON.stringify(chatters));
    res.send({
      'chatters': chatters,
      'status': 'OK'
    });
  } else {
    if (connectedUsers[username].password == req.body.password) {
      res.send({
        'chatters': chatters,
        'status': 'OK'
      });
    } else {
      res.send({
        'chatters': 'FAILED'
      });
    }

  }
});

app.get('/chat', function (req, res) {
  try {
    if (req.session == null) {
      return res.redirect('/');
    }

    if (req.session.userdata == null) {
      return res.redirect('/');
    }

    res.render('chatroom.ejs', {
      username: req.session.userdata.username,
      recipients: chatters
    })
  } catch (e) {
    console.log(e);
  }
})

app.post('/leave', function (req, res) {
  var username = req.body.username;
  chatters.splice(chatters.indexOf(username), 1);
  client.set('chat_users', JSON.stringify(chatters));
  res.send({
    'status': 'OK'
  });
});

app.get('/logout', function (req, res) {
  req.session.userdata = null;
  res.redirect('/');
})

app.post('/send_brdcst_msg', function (req, res) {
  var username = req.body.username;
  var message = req.body.message;
  chat_messages.push({
    'sender': username,
    'message': message,
    'time': (new Date()).getTime()
  });
  client.set('chat_app_messages', JSON.stringify(chat_messages));
  res.send({
    'status': 'OK'
  });
});

app.post('/send_private_msg', function (req, res) {
  var username = req.body.username;
  var message = req.body.message;
  private_messages.push({
    'sender': username,
    'message': message,
    'time': (new Date()).getTime()
  });
  client.set('private_app_messages', JSON.stringify(private_messages));
  res.send({
    'status': 'OK'
  });
});

app.get('/get_messages', function (req, res) {
  res.send(chat_messages);
});

app.get('/get_prv_messages', function (req, res) {
  res.send(private_messages);
});

app.get('/get_chatters', function (req, res) {
  res.send(chatters);
});

io.on('connection', function (socket) {
  // Fire 'send' event for updating Message list in UI
  socket.on('login', function (userdata) {
    userdata.id = socket.id;
    socket.handshake.session.userdata = userdata;
    socket.handshake.session.save();
    connectedUsers[userdata.username] = {
      "id": userdata.id,
      "password": userdata.password
    }
  })

  socket.on("logout", function (userdata) {
    if (socket.handshake.session.userdata) {
      delete connectedUsers[userdata.username];
      delete socket.handshake.session.userdata;
      socket.handshake.session.save();
    }
  });
  socket.on('brd_message', function (data) {
    io.emit('send_brd', data);
  });

  //Fire Personal Message to Receipient
  socket.on('prv-message', function (data) {
    if (connectedUsers[data.username]) {
      io.emit("send_prv", data);
    } else {
      console.log("User does not exist: " + data.username);
    }
  })
  // Fire 'count_chatters' for updating Chatter Count in UI
  socket.on('update_chatter_count', function (data) {
    if (!connectedUsers[data.username])
      io.emit('count_chatters', data);
  });

});