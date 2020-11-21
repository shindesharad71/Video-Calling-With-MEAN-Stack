import * as express from 'express';

const app = express();
const port = process.env.port || 3000;

// app.get('/', (req, res) => {
//   res.send({ message: 'Welcome to server!' });
// });

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});

// Create Socket IO
const io = require('socket.io')(server);

const users = {};

io.on('connection', (socket) => {
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }

  console.log(socket);


  socket.emit('yourID', socket.id);
  io.sockets.emit('allUsers', users);
  socket.on('disconnect', () => {
    delete users[socket.id];
  });

  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('hey', {
      signal: data.signalData,
      from: data.from,
    });
  });

  socket.on('acceptCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

server.on('error', console.error);
