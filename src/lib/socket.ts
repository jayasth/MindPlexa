import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  socket = io("http://localhost:3001", {
    transports: ["websocket"],
  });
};

export const getSocket = () => {
  return socket;
};
