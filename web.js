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


  socket.on('room', (room) => {
    console.log(room, socket.id);
    io.to(room).emit('message', `User  has joined the room`);
    socket.join(room);
  });



  socket.on('send', (data) => {
    if (data === '') {
      io.emit('message', "noroom"); // Broadcast message to all clients
    } else {
      console.log(data);
      socket.to(data.room).emit('message', data.message);
    }
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
