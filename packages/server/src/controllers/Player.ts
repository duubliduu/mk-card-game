import { Socket } from "socket.io";
import { CardType, Room, Side } from "../types";
import Match from "./Match";
import logger from "../utils/logger";
import * as handlers from "../handlers/playerHandlers";
import SocketController from "./SocketController";
import Deck from "./Deck";

class Player extends SocketController {
  name?: string;
  match: Match | null = null;
  deck: Deck;
  hand: [CardType | null, CardType | null, CardType | null] = [
    null,
    null,
    null,
  ];
  side?: Side;

  createMatch: (opponentId: string) => Match = () => new Match();
  handleDisconnect: () => void = () => {};
  joinMatch: (matchId: string) => void = () => {};

  constructor(socket: Socket) {
    super(socket);

    logger.info("Player connected", { playerId: this.id });

    this.emit("connected", socket.id);

    // Send the connected user to others
    this.broadcastTo(Room.QUEUE, "add", {
      id: socket.id,
      name: "",
      inMatch: false,
    });

    this.joinRoom(Room.QUEUE);

    // TODO: Fetch cards from database
    this.deck = new Deck();

    this.registerListeners(handlers);
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

  public hurt(damage: number, message?: string) {
    if (this.match) this.toNamespace(this.match.id, "pop", { damage, message });
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

  fromHand(cardIndex: number): CardType {
    const cardToPlay = this.hand[cardIndex] as CardType;
    const [newCard] = this.deck.draw(1);

    this.hand[cardIndex] = newCard;

    return cardToPlay;
  }
}

export default Player;
