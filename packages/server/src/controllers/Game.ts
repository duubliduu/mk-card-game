import { Socket } from "socket.io";
import Player from "./Player";
import Match from "./Match";

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
    this.players[socket.id] = new Player(socket, this);
  }

  removePlayer(id: string) {
    delete this.players[id];
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

  removeMatch(matchId: string) {
    delete this.matches[matchId];
  }

  createMatch(): Match {
    const match = new Match(this);
    this.matches[match.id] = match;
    return match;
  }

  findMatchById(matchId: string): Match | undefined {
    return this.matches[matchId];
  }
}

export default new Game();
