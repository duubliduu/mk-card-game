import { Game } from "../controllers/Game";
import logger from "../utils/logger";

export function disconnect(game: Game) {
  if (game.match && game.player) {
    game.broadcastTo(game.match.id, "leave");

    if (game.matchExists && game.isMatchVacant) {
      game.endMatch();
    }
  }
  game.disconnect();
  game.broadcastTo("queue", "remove", game.id);
}

export function leave(game: Game) {
  const matchId = game.match?.id;

  game.endMatch();

  const { id, name, inMatch } = game.player ?? {};

  game.broadcastTo("queue", "update", { id, name, inMatch });

  logger.info("User left the match", {
    id: game.id,
    matchId,
  });
}

export function name(game: Game, name: string) {
  logger.info("onName", { name, user: game.id });
  if (game.player) {
    game.player.name = name;
  }
  game.broadcastTo("queue", "update", [game.id, name]);
}

export function match(game: Game, matchId: string) {
  const match =
    matchId === "AI" ? game.startPracticeMatch() : game.matches[matchId];

  if (!match) {
    logger.info("User tried to join a match no longer available", {
      matchId,
      user: game.id,
      matches: game.matches,
    });
    game.emit("message", `Match with id ${matchId} doesn't exist`);
    game.emit("gameOver");
    return;
  }

  logger.info("User entered a match", {
    user: game.id,
    matchId: match.id,
  });

  game.player?.joinMatch(match);

  const { id, name, inMatch } = game.player ?? {};
  game.broadcastTo("queue", "update", { id, name, inMatch });

  if (game.opponent) {
    // Notify one entering a match in progress
    game.emit("enter", match.isReady);
  }
  // Notify the challenger that you have joined
  game.broadcastTo(matchId, "enter", match.isReady);
}

export const challenge = (game: Game, opponentId: string) => {
  logger.info("Challenge event", { id: game.id, opponentId });

  // Create a match
  const match = game.startMatch();

  // send the match to opponent
  game.to(opponentId, "challenge", {
    name: game.player?.name || game.id,
    matchId: match.id,
  });

  // send the match to self
  game.emit("startMatch", match.id);
};
