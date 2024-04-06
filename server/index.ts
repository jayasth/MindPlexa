import { createServer } from "http";
import { Server, Socket } from "socket.io";
import express, { Request, Response } from "express";
import cors from "cors";

interface Node {
  // Define the structure of your node here
}

interface Edge {
  // Define the structure of your edge here
}

interface Data {
  projectId: string;
  nodeId?: string;
  edgeId?: string;
  node?: Node;
  edge?: Edge;
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket: Socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("joinProject", (projectId: string) => {
    socket.join(projectId);
    console.log(`User joined project: ${projectId}`);
  });

  socket.on("leaveProject", (projectId: string) => {
    socket.leave(projectId);
    console.log(`User left project: ${projectId}`);
  });

  socket.on("updateNode", (data: Data) => {
    socket.to(data.projectId).emit("nodeUpdated", data);
  });

  socket.on("updateEdge", (data: Data) => {
    socket.to(data.projectId).emit("edgeUpdated", data);
  });

  socket.on("addNode", (data: Data) => {
    socket.to(data.projectId).emit("nodeAdded", data);
  });

  socket.on("addEdge", (data: Data) => {
    socket.to(data.projectId).emit("edgeAdded", data);
  });

  socket.on("deleteNode", (data: Data) => {
    socket.to(data.projectId).emit("nodeDeleted", data);
  });

  socket.on("deleteEdge", (data: Data) => {
    socket.to(data.projectId).emit("edgeDeleted", data);
  });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
