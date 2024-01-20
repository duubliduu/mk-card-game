import Player from "../controllers/Player";
import logger from "../utils/logger";
import { Room } from "../types";

export const play = (player: Player, cardIndex: number) => {
  if (!player.match) {
    return;
  }

  const cardToPlay = player.fromHand(cardIndex);

  player.match.play(cardToPlay);

  // the played card goes to everybody
  player.toNamespace(player.match.id, "play", player.side, cardToPlay);

  // cards on your hand goes just to you
  player.emit("hand", player.hand);
};

// export function leave(player: Player) {
//   const matchId = player.match?.id;
//
//   const { id, name, inMatch } = player.player ?? {};
//
//   player.broadcastTo("queue", "update", { id, name, inMatch });
//
//   logger.info("User left the match", {
//     id: player.id,
//     matchId,
//   });
// }

export function name(player: Player, name: string) {
  logger.info("Update name", { name, user: player.id });
  player.name = name.trim();
  player.to(Room.QUEUE, "update", { id: player.id, name: player.name });
}

export function match(player: Player, matchId: string) {
  logger.info("Player joined a match", { matchId, playerId: player.id });

  player.joinMatch(matchId);

  player.deck.draw(3).forEach((card, index) => {
    player.hand[index] = card;
  });

  player.emit("hand", player.hand);
  player.emit("side", player.side);
  player.emit("inTurn", player.inTurn);
  player.emit("stack", player.match?.stack ?? {});

  player.toNamespace(matchId, "ready", player.match?.isReady);

  if (player.opponent) {
    const { id, name } = player.opponent;

    logger.info(`The match ${matchId} has opponent ${player.opponent.name}`, {
      id,
      name,
    });

    player.emit("opponent", { id, name });
    player.to(id, "opponent", { id: player.id, name: player.name });
  }
}

export const challenge = (player: Player, opponentId: string) => {
  logger.info("Challenge event", { playerId: player.id, opponentId });

  const match = player.createMatch(opponentId);

  // send the match to opponent
  player.to(opponentId, "challenge", {
    name: player?.name || player.id,
    matchId: match.id,
  });

  // send the match to self
  player.emit("startMatch", match.id);
};

export const disconnect = (player: Player) => {
  logger.info("Player disconnected", { playerId: player.id });
  player.handleDisconnect();
};

export const afterPlay = (player: Player) => {
  player.emit("hitPoints", player.match?.hitPoints || {});
  player.emit("inTurn", player.inTurn);
};
