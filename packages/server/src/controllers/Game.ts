import { Socket } from "socket.io";
import Player from "./Player";
import Match from "./Match";
import { Room } from "../types";
import logger from "../utils/logger";

export class Game {
  players: Record<string, Player> = {};
  matches: Record<string, Match> = {};

  get connectedPlayers() {
    return Object.values(this.players).map(({ id, name, inMatch }) => ({
      id,
      name,
      inMatch,
    }));
  }

  connectPlayer(socket: Socket) {
    const player = new Player(socket);

    player.emit(Room.QUEUE, this.connectedPlayers);

    player.handleDisconnect = () => {
      delete this.players[socket.id];
      player.to(Room.QUEUE, "remove", socket.id);
    };

    player.createMatch = (): Match => {
      const match = new Match();
      this.matches[match.id] = match;
      return match;
    };

    player.joinMatch = (matchId: string) => {
      const match = this.matches[matchId];

      if (!match) {
        logger.error("Match not found", { matchId });
        return;
      }

      player.side = this.matches[matchId].join(player);
      player.match = this.matches[matchId];

      player.leaveRoom("queue");
      player.joinRoom(matchId);
    };

    // Add new user to list
    this.players[socket.id] = player;
  }

  // startPracticeMatch() {
  //   const match = this.startMatch();
  //
  //   const aiClient = new AIClient();
  //   aiClient.socket.emit("match", match.id);
  //
  //   logger.info("Practice match started", {
  //     matchId: match.id,
  //     aiId: `${aiClient.id}`,
  //     user: this.id,
  //   });
  //
  //   return match;
  // }

  // kickOpponent() {
  //   if (this.opponent && this.match) {
  //     // Notify the opponent of my leaving
  //     this.to(this.opponent.id, "leave", this.match.id);
  //     logger.info("Opponent kicked!", {
  //       opponentId: this.opponent.id,
  //       matchId: this.match.id,
  //     });
  //   }
  // }
  //
  // leaveMatch() {
  //   if (this.match) {
  //     this.match.players[Side.Left] = null;
  //     this.broadcastTo("queue", "leave", this.match.id);
  //     logger.info("User left the match!", {
  //       matchId: this.match.id,
  //       user: this.id,
  //     });
  //   }
  // }
  //
  // endMatch() {
  //   if (this.match && this.match.id in this.matches) {
  //     delete this.matches[this.match.id];
  //     logger.info("Match ended", { matchId: this.match.id });
  //   }
  // }
}

export default new Game();
