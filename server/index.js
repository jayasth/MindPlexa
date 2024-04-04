const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

  // Add more event listeners as needed for other features like comments, etc.

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Error handling middleware
app.use((err, req, res) => {
  // Remove `next` from the parameters
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
