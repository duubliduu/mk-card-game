import { Socket } from "socket.io";
import { CardType, Room, Side } from "../types";
import Match from "./Match";
import logger from "../utils/logger";
import * as handlers from "../handlers/playerHandlers";
import SocketController from "./SocketController";
import Deck from "./Deck";
import { Game } from "./Game";
import { Attributes } from "../types/player";
import { generateAttributes } from "../utils/generateCharacteristics";

class Player extends SocketController {
  game: Game;
  match: Match | null = null;
  // TODO: Fetch cards from database
  attributes: Attributes = generateAttributes();
  // TODO: Fetch cards from database
  deck: Deck = new Deck();
  hand: CardType[] = [];
  side?: Side;
  name?: string;

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
    if (this.side === Side.Left) {
      return Side.Right;
    }
    return Side.Left;
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

  constructor(socket: Socket, game: Game) {
    super(socket);

    this.game = game;

    logger.info("Player connected", { playerId: this.id });

    this.emit("connected", socket.id);
    this.emit(Room.QUEUE, this.game.connectedPlayers);
    this.emit("images", this.deck.images);

    // Send the connected user to others
    this.broadcastTo(Room.QUEUE, "add", {
      id: socket.id,
      name: "",
      inMatch: false,
    });

    this.joinRoom(Room.QUEUE);

    this.registerListeners(handlers);
  }

  win() {
    this.emit("gameOver", "win");
    this.handleLeaveMatch();
  }

  lose() {
    this.emit("gameOver", "lose");
    this.handleLeaveMatch();
  }

  toString() {
    const { socket, ...rest } = this;

    return JSON.stringify(rest);
  }

  findCardByIndex(cardIndex: number): CardType {
    const { ...cardToPlay } = this.hand[cardIndex] as CardType;
    return cardToPlay;
  }

  supplementHand = (cardIndex: number) => {
    const [newCard] = this.deck.draw(1);
    this.hand.splice(cardIndex, 1);
    this.hand.push(newCard);
  };

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
