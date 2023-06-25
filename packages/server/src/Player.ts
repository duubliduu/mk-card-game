import { Socket } from "socket.io";
import { CardType, Side } from "./types";
import generateDeck from "./utils/generateDeck";
import Match from "./Match";
import logger from "./utils/logger";

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

    socket.on("play", (index: number) => {
      if (!this.match) {
        socket.emit(
          "message",
          "Cannot play a card, because you're not in a match"
        );
        return;
      }

      if (!this.inTurn) {
        socket.emit("message", "Wait for your turn!");
        return;
      }

      const cardToPlay = this.hand[index];

      delete this.hand[index];

      this.draw(index);

      if (cardToPlay === null) {
        socket.emit("message", "You don't have card at that index");
        return;
      }

      // Play the card
      this.match.play(cardToPlay);

      // the played card goes to everybody
      socket.nsp.to(this.match.id).emit("play", cardToPlay);

      // hand goes just to you
      socket.emit("hand", this.hand);

      // send side to everyone
      socket.emit("side", this.side);
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

  draw(...indexes: number[]) {
    indexes.forEach((index) => {
      const [card] = this.deck.splice(0, 1);
      this.hand[index] = card;
    });
  }

  resolveGameState() {
    if (!this.match || this.side === undefined) {
      // This player is not in a game
      return null;
    }

    return this.match.hitPoints[this.side] > 0;
  }

  public hurt(damage: number, message?: string) {
    if (this.match !== null) {
      if (damage) {
        this.socket.nsp.to(this.match.id).emit("pop", damage);
      } else if (message) {
        this.socket.nsp.to(this.match.id).emit("pop", message);
      }
    }
  }

  public joinMatch(match: Match, onGameOver: Function) {
    // generate random deck for the player
    this.deck = generateDeck();

    // Draw three
    this.draw(0, 1, 2);

    this.socket.emit("hand", this.hand);

    this.match = match;

    const side = this.match.setSide(this);

    if (side === undefined) {
      return false;
    }

    // Set side
    this.side = side;

    // Push the current stack to player
    this.socket.emit("stack", this.match.stack);

    // Join the room
    this.socket.leave("queue");
    this.socket.join(this.match.id);

    this.match.on("afterPlay", () => {
      this.socket.emit("hitPoints", this.match?.hitPoints);
      this.socket.emit("inTurn", this.inTurn);

      if (this.resolveGameState() === false) {
        this.socket.emit("gameOver", "lose");
        this.socket.broadcast.to(this.match!.id).emit("gameOver", "win");
      }
    });

    this.socket.emit("side", this.side);
    this.socket.emit("inTurn", this.inTurn);

    if (this.opponent) {
      // Emit your name to opponent
      const { id, name } = this.opponent || {};
      this.socket.emit("opponent", { id, name });
      this.socket.to(id).emit("opponent", { id: this.id, name: this.name });
    }
  }

  public leaveMatch() {
    // Get the opponent's id before we levae the game
    let opponentId;
    const opposingSide = Number(!this.side) as Side;

    logger.info("Resolving sides", { mySide: this.side, opposingSide });

    if (opposingSide !== undefined) {
      opponentId = this.match?.players[opposingSide]?.socket.id;
      logger.info("Match has someone else in it with id", {
        id: this.socket.id,
        opponentId,
      });
    }

    if (this.match && this.side !== undefined) {
      // Remove self from match
      this.match.players[this.side] = null;
      // Return to queue
      this.socket.leave(this.match.id);
      this.socket.join("queue");

      this.match = null;
    }

    return opponentId;
  }

  toString() {
    const { socket, ...rest } = this;

    return JSON.stringify(rest);
  }
}

export default Player;
