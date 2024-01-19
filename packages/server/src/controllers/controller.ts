import { Socket } from "socket.io";

abstract class Controller {
  socket: Socket | null = null;

  connect(socket: Socket) {
    this.socket = socket;
  }
  registerHandlers(handlers: { [event: string]: (...params: any[]) => void }) {
    Object.entries(handlers).forEach(([event, handler]) => {
      this.socket?.on(event, (...params) => {
        handler(this, ...params);
      });
    });
  }

  broadcastTo(channel: string, event: string, payload?: any) {
    this.socket?.broadcast.to(channel).emit(event, payload);
  }

  to(channel: string, event: string, payload: any) {
    return this.socket?.to(channel).emit(event, payload);
  }

  emit(event: string, payload?: any) {
    return this.socket?.emit(event, payload);
  }

  toNamespace(namespace: string, event: string, payload?: any) {
    return this.socket?.nsp.to(namespace).emit(event, payload);
  }

  leave(room: string) {
    return this.socket?.leave(room);
  }

  join(room: string) {
    return this.socket?.join(room);
  }
}
export default Controller;
