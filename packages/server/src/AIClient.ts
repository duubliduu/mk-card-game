import logger from "./utils/logger";
import { io, Socket } from "socket.io-client";

class AIClient {
  socket: Socket;
  isMyTurn: boolean = false;
  hasEnded: boolean = false;

  private handleReady?: (socket: Socket) => void;

  constructor() {
    logger.info("AIClient created");

    this.socket = io("ws://localhost:8080");

    this.socket.on("connect", () => {
      if (typeof this.handleReady === "function") {
        this.handleReady(this.socket);
      }
    });

    this.socket.on("disconnect", () => {
      logger.info("AI disconnected");
    });

    // Update IA name
    this.socket.emit("name", "AI boi");

    this.socket.on("gameOver", () => {
      // Leave the game on game over
      logger.info("AI gameOver was called");
      this.hasEnded = true;
      this.socket.emit("leave");

      // Manually disconnect
      this.socket.disconnect();
    });

    this.socket.on("leave", () => {
      logger.info("Player left the AI match");

      this.hasEnded = true;

      // Manually disconnect
      this.socket.disconnect();
    });

    this.socket.on("inTurn", (inTurn: boolean) => {
      this.isMyTurn = inTurn;

      logger.info("AI inTurn is called", { inTurn });

      if (this.isMyTurn) {
        logger.info("It is the AI's turn");

        setTimeout(() => {
          const randomCardIndex = this.randomCardIndex;

          logger.info("AI plays random a card", { randomCardIndex });

          // Emit to backend
          this.socket.emit("play", randomCardIndex);
        }, 2000);
      }
    });

    this.socket.on("opponent", () => {
      // AI doesn't care about opponent
      logger.info("AI's opponent is ready! Will play starting card");

      const randomCardIndex = this.randomCardIndex;

      logger.info("AI instantly plays the starting card", { randomCardIndex });

      logger.info(`the type of this.socket ${typeof this.socket}`);
      // Emit to backend
      this.socket.emit("play", randomCardIndex);
    });

    this.socket.on("challenge", (payload: { [matchId: string]: string }) => {
      logger.info("AI received a challenge!");
      this.socket.emit("match", payload.matchId);
    });
  }

  get id() {
    return this.socket.id;
  }

  get randomCardIndex() {
    return Math.ceil(Math.random() * 3) - 1;
  }

  onReady(callback: (socket?: Socket) => void) {
    this.handleReady = callback;
  }
}

export default AIClient;
