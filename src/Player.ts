import { Socket } from "socket.io";
import { CardType, Side } from "./types/card";
import generateDeck from "./utils/generateDeck";
import Match from "./Match";

export enum Status {
  inQueue,
  inMatch,
}

class Player {
  socket: Socket;
  match?: Match;
  deck: CardType[] = [];
  hand: [CardType | null, CardType | null, CardType | null] = [
    null,
    null,
    null,
  ];
  side?: Side;

  constructor(socket: Socket) {
    this.socket = socket;
    this.deck = generateDeck();
    this.draw(0, 1, 2);

    socket.emit("hand", this.hand);
    socket.emit("identify", socket.id);

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

  draw(...indexes: number[]) {
    indexes.forEach((index) => {
      const [card] = this.deck.splice(0, 1);
      this.hand[index] = card;
    });
  }

  get status() {
    if (this.match) {
      return Status.inMatch;
    }
    return Status.inQueue;
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

  joinMatch(match: Match, side: Side) {
    this.socket.join(match.id);

    this.match = match;
    this.side = side;

    this.match.on("afterPlay", () => {
      this.socket.emit("hitPoints", this.hitPoints);
      this.socket.emit("inTurn", this.inTurn);
    });

    this.socket.emit("hitPoints", this.hitPoints);
    this.socket.emit("inTurn", this.inTurn);
  }
}

export default Player;
