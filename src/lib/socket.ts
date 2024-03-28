// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
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

    socket.connect();
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};
