import { Socket } from "socket.io";
import Player from "./Player";
import Match from "./Match";
import AIClient from "./AIClient";
import logger from "../utils/logger";

export class Game {
  // TODO: Rename to clients?
  players: Record<string, Player> = {};
  matches: Record<string, Match> = {};
  aiClients: Record<string, AIClient> = {};

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

  startPracticeMatch() {
    const match = this.createMatch();

    const aiClient = new AIClient();
    aiClient.socket.emit("match", match.id);

    this.aiClients[aiClient.id] = aiClient;

    logger.info("Practice match created", {
      matchId: match.id,
      aiClientId: `${aiClient.id}`,
    });
  }

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
