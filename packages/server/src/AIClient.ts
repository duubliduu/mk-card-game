import logger from "./utils/logger";
import { io, Socket } from "socket.io-client";
import * as handlers from "./handlers";

class AIClient {
  socket: Socket;
  isMyTurn: boolean = false;
  hasEnded: boolean = false;

  handleReady?: (socket: Socket) => void;

  constructor() {
    logger.info("AIClient created");

    this.socket = io("ws://localhost:8080");

    this.socket.emit("name", "AI boi");

    this.registerListeners();
  }

  get id() {
    return this.socket.id;
  }

  registerListeners() {
    this.socket.on("connect", () => {
      handlers.onConnect(this);
    });

    this.socket.on("disconnect", () => {
      handlers.onDisconnect();
    });

    this.socket.on("gameOver", () => {
      handlers.onGameOver(this);
    });

    this.socket.on("leave", () => {
      handlers.onLeave(this);
    });

    this.socket.on("inTurn", (inTurn: boolean) => {
      handlers.onInTurn(this, inTurn);
    });

    this.socket.on("opponent", () => {
      handlers.onOpponent(this);
    });

    this.socket.on("challenge", (payload: { [matchId: string]: string }) => {
      handlers.onChallenge(this, payload);
    });
  }

  onReady(callback: (socket?: Socket) => void) {
    this.handleReady = callback;
  }
}

export default AIClient;
