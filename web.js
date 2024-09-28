const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Use process.env.PORT for Railway deployment
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
  }
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('joinRoom', (data) => {
    socket.join(data.value);
    io.to(data.value).emit('message', `User ${data.user} has joined the room`);
  });

  socket.on('message', (message) => {
    console.log(message);
    io.emit('message', message.message);
  });

  socket.on('send', (data) => {
    if (data === '') {
      io.emit('message', "noroom"); // Broadcast message to all clients
    } else {
      console.log(data);
      socket.to(data.room).emit('message', data.message);
    }
  });

  socket.on('room', (room) => {
    console.log(room, socket.id);
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Assigned port: ${port}`);  // Log the assigned port
});
