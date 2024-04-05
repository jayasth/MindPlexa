import { Server } from "socket.io";

interface NodeUpdatePayload {
  projectId: string;
  nodeId: string;
  nodeData: any;
}

interface EdgeUpdatePayload {
  projectId: string;
  edgeId: string;
  edgeData: any;
}

export function registerSocketEvents(io: Server) {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinProject", (projectId: string) => {
      socket.join(projectId);
      console.log(`User joined project: ${projectId}`);
    });

    socket.on("updateNode", (payload: NodeUpdatePayload) => {
      socket.to(payload.projectId).emit("nodeUpdated", payload);
    });

    socket.on("updateEdge", (payload: EdgeUpdatePayload) => {
      socket.to(payload.projectId).emit("edgeUpdated", payload);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
