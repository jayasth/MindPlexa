import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { registerSocketEvents } from "./socketEvents";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

registerSocketEvents(io);

app.use(cors());

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
    console.log(`User joined project: ${projectId}`);
  });

  socket.on("leaveProject", (projectId) => {
    socket.leave(projectId);
    console.log(`User left project: ${projectId}`);
  });

  socket.on("nodeUpdate", (data) => {
    socket.to(data.projectId).emit("nodeUpdated", data);
  });

  socket.on("edgeUpdate", (data) => {
    socket.to(data.projectId).emit("edgeUpdated", data);
  });

  // Existing event listeners
  socket.on("newIdea", (idea) => {
    io.emit("newIdea", idea);
  });

  socket.on("ideaVoted", (updatedIdea) => {
    io.emit("ideaVoted", updatedIdea);
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
