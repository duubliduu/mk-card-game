import { Socket } from "socket.io";
import logger from "../utils/logger";
import Player from "./Player";
import Match from "./Match";
import * as handlers from "../handlers/gameHandlers";
import AIClient from "./AIClient";
import { Side } from "../types";
import Controller from "./controller";

export class Game extends Controller {
  players: Record<string, Player> = {};
  matches: Record<string, Match> = {};

  start(socket: Socket) {
    this.connect(socket);

    logger.info("User connected", { user: socket.id });

    // Everyone goes to the queue by default
    socket.join("queue");

    // Identify the user for them
    socket.emit("id", socket.id);

    // Send list of players in queue to
    socket.emit(
      "queue",
      Object.values(this.players).map(({ id, name, inMatch }) => ({
        id,
        name,
        inMatch,
      }))
    );

    // Send the connected user to others
    this.broadcastTo("queue", "add", {
      id: socket.id,
      name: "",
      inMatch: false,
    });

    // Add new user to list
    this.players[socket.id] = new Player(socket);

    this.registerHandlers(handlers);
  }
  get id() {
    return this.socket?.id;
  }

  get player(): Player | undefined {
    if (this.socket && this.socket.id in this.players) {
      return this.players[this.socket.id];
    }
  }

  get opponent(): Player | null | undefined {
    if (this.player && this.player.match) {
      return this.player.match?.players[Side.Right];
    }
  }

  get match(): Match | null | undefined {
    return this.player?.match;
  }

  get matchExists(): boolean {
    return !!this.match && this.match.id in this.matches;
  }

  get isMatchVacant() {
    return Object.values(this.match?.players ?? {}).every((x) => x === null);
  }

  startMatch() {
    const match = new Match();

    this.matches[match.id] = match;

    logger.info("Match started", {
      matchId: match.id,
      user: this.id,
      matches: this.matches,
    });

    return match;
  }

  startPracticeMatch() {
    const match = this.startMatch();

    const aiClient = new AIClient();
    aiClient.socket.emit("match", match.id);

    logger.info("Practice match started", {
      matchId: match.id,
      aiId: `${aiClient.id}`,
      user: this.id,
    });

    return match;
  }

  kickOpponent() {
    if (this.opponent && this.match) {
      // Notify the opponent of my leaving
      this.to(this.opponent.id, "leave", this.match.id);
      logger.info("Opponent kicked!", {
        opponentId: this.opponent.id,
        matchId: this.match.id,
      });
    }
  }

  leaveMatch() {
    if (this.match) {
      this.match.players[Side.Left] = null;
      this.broadcastTo("queue", "leave", this.match.id);
      logger.info("You left the match!", {
        matchId: this.match.id,
      });
    }
  }

  endMatch() {
    this.kickOpponent();
    this.leaveMatch();

    if (this.match && this.match.id in this.matches) {
      delete this.matches[this.match.id];
      logger.info("Match ended", { matchId: this.match.id });
    }
  }

  disconnect() {
    if (this.id && this.id in this.players) {
      delete this.players[this.id];
    }
  }

  broadcastTo(channel: string, event: string, payload?: any) {
    this.socket?.broadcast.to(channel).emit(event, payload);
  }

  to(channel: string, event: string, payload: any) {
    return this.socket?.to(channel).emit(event, payload);
  }

  emit(event: string, payload?: any) {
    return this.socket?.emit(event, payload);
  }
}

export default new Game();
