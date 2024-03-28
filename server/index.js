// server/index.js
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001", // Update the origin to match the client's URL and port
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("A user connected");

  // Event listeners
  socket.on("newIdea", (idea) => {
    // Broadcast the new idea to all connected clients
    io.emit("newIdea", idea);
  });

  socket.on("ideaVoted", (updatedIdea) => {
    // Broadcast the updated idea to all connected clients
    io.emit("ideaVoted", updatedIdea);
  });

  // Add more event listeners as needed

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
