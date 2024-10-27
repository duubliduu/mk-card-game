import { io, Socket } from "socket.io-client";

let socket: Socket;

// If you want to connect to a socket, set CONNECT_TO_SOCKET to true
// and set the REACT_APP_SOCKET_URL environment variable to the socket URL
// This is for development purposes only
const CONNECT_TO_SOCKET = true;

if (CONNECT_TO_SOCKET) {
  socket = io(process.env.REACT_APP_SOCKET_URL || {});
} else {
  socket = {
    on: (...args: any[]) => {},
    emit: (...args: any[]) => {},
    off: (...args: any[]) => {},
  } as unknown as Socket;
}
export default socket;
