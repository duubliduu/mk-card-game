import Player from "../controllers/Player";
import logger from "../utils/logger";
import { Room, Side } from "../types";
import Match from "../controllers/Match";

export const play = (player: Player, cardIndices: number[]) => {
  logger.info("Player played a card", { cardIndices, playerId: player.id });

  if (!player.match || player.side === undefined) {
    player.emit("exit");
    return;
  }

  player.match.play(player.side, cardIndices);
};

export function leaveMatch(player: Player) {
  const matchId = player.match?.id;

  if (!matchId) {
    logger.error("Player is not in a match", { playerId: player.id });
    return;
  }

  player.handleLeaveMatch();
}

export function name(player: Player, name: string) {
  logger.info("Update name", { name, user: player.id });
  player.name = name.trim();
  player.to(Room.QUEUE, "update", { id: player.id, name: player.name });
}

export function joinMatch(player: Player, matchId: string) {
  const match = player.game.findMatchById(matchId);

  if (!match) {
    logger.error("Match not found", { matchId });
    return;
  }

  player.side = match.join(player);
  player.match = match;
  player.hand = player.deck.draw(5);

  player.leaveRoom(Room.QUEUE);
  player.joinRoom(matchId);

  player.emit("hand", player.hand);
  logger.info("side", player.side);
  player.emit("side", player.side);

  player.toNamespace(matchId, "ready", player.match?.hasPlayers);
  logger.info(`Is player ready ${player.match?.hasPlayers}`);

  if (player.opponent) {
    const { id, name } = player.opponent;

    logger.info(
      `The match ${matchId} has opponent ${
        player.opponent.name || player.opponent.id
      }`,
      {
        id,
        name,
      }
    );

    player.emit("opponent", { id, name });
    player.to(id, "opponent", { id: player.id, name: player.name });
  }

  logger.info("Player joined a match", { matchId, playerId: player.id });
}

export const sendChallenge = (player: Player, opponentId: string) => {
  const match = player.game.createMatch();

  player.to(opponentId, "challenge", {
    name: player.name || player.id,
    matchId: match.id,
  });

  // send the match to self
  player.emit("startMatch", match.id);
};

export const disconnect = (player: Player) => {
  logger.info("Player disconnected", { playerId: player.id });

  player.handleLeaveMatch();

  player.to(Room.QUEUE, "remove", player.id);

  player.game.removePlayer(player.id);
};

export const afterPlay = (
  player: Player,
  match: Match,
  results: {
    damage: { [Side.Left]: number; [Side.Right]: number };
    message: string;
  }[]
) => {
  player.emit("table", match.table);
  player.emit("hand", player.hand);
  player.emit("results", results);
  player.emit("play", match.cardsOnTable);
  player.emit("hitPoints", match.hitPoints);
};
