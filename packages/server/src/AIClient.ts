import logger from "./utils/logger";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

class AIClient {
  public id: string = uuidv4();

  socket: Socket;
  isMyTurn: boolean = false;

  hasEnded: boolean = false;

  constructor() {
    this.socket = io("ws://localhost:8080");

    this.socket.on("connect", () => {});
    this.socket.on("disconnect", () => {
      logger.warn("Client connection lost");
    });

    logger.info("AIClient created");

    this.socket.emit("name", "AI boi");

    this.socket.on("gameOver", () => {
      // Leave the game on game over
      logger.info("AI gameOver was called");
      this.hasEnded = true;
      this.socket.emit("leave");
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
  }

  get randomCardIndex() {
    return Math.ceil(Math.random() * 3) - 1;
  }
}

export default AIClient;
