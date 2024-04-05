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
    socket.on("newIdea", () => {
      // Handle new idea event
    });

    socket.on("ideaVoted", () => {
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
