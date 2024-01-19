import { Socket } from "socket.io";
import { CardType, Side } from "../types";
import generateDeck from "../utils/generateDeck";
import Match from "./Match";
import logger from "../utils/logger";
import * as handlers from "../handlers/playerHandlers";

class Player {
  socket: Socket;
  name?: string;
  match: Match | null = null;
  deck: CardType[] = [];
  hand: [CardType | null, CardType | null, CardType | null] = [
    null,
    null,
    null,
  ];
  side?: Side;
  constructor(socket: Socket) {
    this.socket = socket;

    // send side to everyone
    this.socket.emit("side", this.side);

    // Register listeners
    this.socket.on("play", (cardIndex: number) => {
      handlers.onPlay(this, cardIndex);
    });
  }

  get inTurn() {
    return this.match && this.side === this.match.side;
  }

  get hitPoints(): number | undefined {
    if (!this.match || this.side === undefined) {
      return undefined;
    }
    return this.match.hitPoints[this.side];
  }

  get id(): string {
    return this.socket.id;
  }

  get opposingSide(): Side {
    return Number(!this.side);
  }

  get opponent(): Player | null {
    if (!this.match) {
      return null;
    }
    return this.match.players[this.opposingSide];
  }

  get inMatch(): boolean {
    return !!this.match;
  }

  drawFromDeck(...indexes: number[]) {
    indexes.forEach((index) => {
      const [card] = this.deck.splice(0, 1);
      this.hand[index] = card;
    });
  }

  public hurt(damage: number, message?: string) {
    if (this.match !== null) {
      this.socket.nsp.to(this.match.id).emit("pop", { damage, message });
    }
  }

  public joinMatch(match: Match) {
    this.match = match;

    this.deck = generateDeck();

    this.drawFromDeck(0, 1, 2);

    this.socket.emit("hand", this.hand);

    // Add player to match
    const side = this.match.join(this);

    if (side === undefined) {
      return false;
    }
    // Set side
    this.side = side;
    logger.info(`Player assigned to a side`, {
      user: this.id,
      side: Side[side],
    });

    // Join the room
    this.socket.leave("queue");
    this.socket.join(this.match.id);

    // Push the current stack to player
    this.socket.emit("stack", this.match.stack);
    this.socket.emit("side", this.side);
    this.socket.emit("inTurn", this.inTurn);

    this.match.on("afterPlay", (isGameOver: boolean, match: Match | null) => {
      if (!this.match) {
        logger.warn("The match is already over");
        match = null;
        return;
      }

      this.socket.emit("hitPoints", this.match?.hitPoints);
      this.socket.emit("inTurn", this.inTurn);
    });

    if (this.opponent) {
      logger.info(`The match ${match.id} has opponent ${this.opponent.name}`, {
        user: this.id,
        opponent: this.opponent.id,
      });
      // Emit your name to opponent
      const { id, name } = this.opponent || {};

      this.socket.emit("opponent", { id, name });
      this.socket.to(id).emit("opponent", { id: this.id, name: this.name });
    }
  }

  win() {
    this.socket.emit("gameOver", "win");
  }

  lose() {
    this.socket.emit("gameOver", "lose");
  }

  toString() {
    const { socket, ...rest } = this;

    return JSON.stringify(rest);
  }
}

export default Player;
