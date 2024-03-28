// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001", {
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
    socket.on("newIdea", (idea: any) => {
      // Handle new idea event
    });

    socket.on("ideaVoted", (updatedIdea: any) => {
      // Handle idea voted event
    });

    // Add more event listeners as needed

    socket.connect();
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};
