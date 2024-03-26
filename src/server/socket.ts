import { Server } from "socket.io";

export default function initializeSocket(server: any) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinSession", (sessionId) => {
      socket.join(sessionId);
    });

    socket.on("ideaGenerated", (data) => {
      io.to(data.sessionId).emit("newIdea", data.idea);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
