import { useCallback, useEffect } from "react";
import socket from "../services/socket";

const useSocket = (events: { [event: string]: (...args: any[]) => void }) => {
  useEffect(() => {
    Object.entries(events).forEach(([key, value]) => {
      socket.on(key, value);
    });
    return () => {
      Object.keys(events).forEach((key) => {
        socket.off(key);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useCallback((event: string, payload?: any) => {
    socket.emit(event, payload);
  }, []);
};

export default useSocket;
