import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = (events: { [key: string]: (...args: any[]) => void }) => {
  const socketRef = useRef<Socket>();
  useEffect(() => {
    socketRef.current = io();

    Object.entries(events).forEach(([key, value]) => {
      socketRef.current!.on(key, value);
    });
  }, [events]);

  return socketRef;
};

export default useSocket;
