import { Socket } from "socket.io";

abstract class SocketController {
  protected socket: Socket;

  protected constructor(socket: Socket) {
    this.socket = socket;
  }

  joinRoom(room: string) {
    this.socket.join(room);
  }

  leaveRoom(room: string) {
    this.socket.leave(room);
  }

  broadcastTo(channel: string, event: string, payload?: any) {
    this.socket.broadcast.to(channel).emit(event, payload);
  }

  to(channel: string, event: string, payload: any) {
    return this.socket.to(channel).emit(event, payload);
  }

  toNamespace(namespace: string, event: string, ...payload: any[]) {
    return this.socket.nsp.to(namespace).emit(event, ...payload);
  }

  emit(event: string, payload?: any) {
    return this.socket.emit(event, payload);
  }

  on(event: string, callback: (...args: any[]) => void) {
    return this.socket.on(event, (...args) => {
      callback(this, ...args);
    });
  }

  registerListeners(handlers: Record<string, (...args: any[]) => void>) {
    Object.entries(handlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }
}

export default SocketController;
