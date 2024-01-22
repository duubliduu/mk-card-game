import { Socket } from "socket.io";
import { CardType, Room, Side } from "../types";
import Match from "./Match";
import logger from "../utils/logger";
import * as handlers from "../handlers/playerHandlers";
import SocketController from "./SocketController";
import Deck from "./Deck";
import { Game } from "./Game";

class Player extends SocketController {
  game: Game;
  match: Match | null = null;
  deck: Deck;
  hand: [CardType | null, CardType | null, CardType | null] = [
    null,
    null,
    null,
  ];
  side?: Side;
  name?: string;

  constructor(socket: Socket, game: Game) {
    super(socket);

    this.game = game;

    logger.info("Player connected", { playerId: this.id });

    this.emit("connected", socket.id);
    this.emit(Room.QUEUE, this.game.connectedPlayers);

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
    if (!this.match || !this.side) {
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
    this.handleLeaveMatch();
    this.emit("gameOver", "win");
  }

  lose() {
    this.handleLeaveMatch();
    this.emit("gameOver", "lose");
  }

  toString() {
    const { socket, ...rest } = this;

    return JSON.stringify(rest);
  }

  findCardByIndex(cardIndex: number): CardType {
    const cardToPlay = this.hand[cardIndex] as CardType;
    const [newCard] = this.deck.draw(1);

    this.hand[cardIndex] = newCard;

    return cardToPlay;
  }

  handleLeaveMatch() {
    if (!this.match || !this.side) {
      logger.error("Player is not in a match", { playerId: this.id });
      return;
    }

    const matchId = this.match.id;
    this.emit("leave", matchId);

    this.match.leave(this.side);
    this.match = null;

    this.broadcastTo(Room.QUEUE, "update", {
      id: this.id,
      name: this.name,
      inMatch: this.inMatch,
    });

    this.leaveRoom(matchId);
    this.joinRoom(Room.QUEUE);

    this.emit("leave", matchId);

    logger.info("Player left the match", {
      playerId: this.id,
      matchId,
    });
  }
}

export default Player;
