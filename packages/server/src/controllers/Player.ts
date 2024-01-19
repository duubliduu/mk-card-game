import { Socket } from "socket.io";
import { CardType, Side } from "../types";
import generateDeck from "../utils/generateDeck";
import Match from "./Match";
import logger from "../utils/logger";
import * as handlers from "../handlers/playerHandlers";
import Controller from "./controller";

class Player extends Controller {
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
    super();

    this.connect(socket);

    this.emit("side", this.side);

    this.registerHandlers(handlers);
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

  get id(): string | undefined {
    return this.socket?.id;
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
      this.toNamespace(this.match.id, "pop", { damage, message });
    }
  }

  public joinMatch(match: Match) {
    this.match = match;
    this.deck = generateDeck();

    this.drawFromDeck(0, 1, 2);

    this.emit("hand", this.hand);

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
    this.leave("queue");
    this.join(this.match.id);

    // Push the current stack to player
    this.emit("stack", this.match.stack);
    this.emit("side", this.side);
    this.emit("inTurn", this.inTurn);

    this.match.on("afterPlay", () => {
      handlers.afterPlay(this);
    });

    if (this.opponent && this.opponent.id) {
      logger.info(`The match ${match.id} has opponent ${this.opponent.name}`, {
        user: this.id,
        opponent: this.opponent.id,
      });
      this.emit("opponent", { id: this.opponent.id, name: this.opponent.name });
      this.to(this.opponent.id, "opponent", { id: this.id, name: this.name });
    }
  }

  win() {
    this.emit("gameOver", "win");
  }

  lose() {
    this.emit("gameOver", "lose");
  }

  toString() {
    const { socket, ...rest } = this;

    return JSON.stringify(rest);
  }
}

export default Player;
