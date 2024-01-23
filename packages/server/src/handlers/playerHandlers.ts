import Player from "../controllers/Player";
import logger from "../utils/logger";
import { CardType, Room } from "../types";

export const play = (player: Player, cardIndex: number) => {
  if (!player.match) {
    return;
  }

  const cardToPlay = player.findCardByIndex(cardIndex);

  player.match.play(cardToPlay);

  // the played card goes to everybody
  player.toNamespace(player.match.id, "play", player.side, cardToPlay);

  // cards on your hand goes just to you
  player.emit("hand", player.hand);
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
  player.hand = player.deck.draw(3) as [CardType, CardType, CardType];

  player.leaveRoom(Room.QUEUE);
  player.joinRoom(matchId);

  player.emit("hand", player.hand);
  player.emit("side", player.side);
  player.emit("inTurn", player.inTurn);
  player.emit("stack", player.match?.stack ?? {});

  player.toNamespace(matchId, "ready", player.match?.isReady);

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

  if (player.match && player.side) {
    player.match.players[player.side] = null;

    if (player.match.id in player.game.matches)
      player.game.removeMatch(player.match.id);
  }

  player.to(Room.QUEUE, "remove", player.id);

  player.game.removePlayer(player.id);
};

export const afterPlay = (player: Player) => {
  player.emit("hitPoints", player.match?.hitPoints || {});
  player.emit("inTurn", player.inTurn);
  if (player.match) {
    player.to(player.match.id, "inTurn", player.opponent?.inTurn);
  }
};
