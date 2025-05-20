import { io } from "socket.io-client";

const socket = io('https://septica-backend.onrender.com');


const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
