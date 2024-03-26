import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  socket = io("http://localhost:3001", {
    transports: ["websocket"],
  });

  // Add event listeners for BrainstormBuddy
  socket.on("brainstormingSessionCreated", (session: any) => {
    // Handle new brainstorming session created event
  });

  socket.on("ideaGenerated", (idea: any) => {
    // Handle new idea generated event
  });

  socket.on("collaborationMessage", (message: any) => {
    // Handle new collaboration message event
  });

  // Add more event listeners as needed
};

export const getSocket = () => {
  return socket;
};
