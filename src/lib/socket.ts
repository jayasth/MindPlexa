import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = () => {
  socket = io("http://localhost:3000", {
    transports: ["websocket"],
  });
};

export const getSocket = () => {
  return socket;
};
