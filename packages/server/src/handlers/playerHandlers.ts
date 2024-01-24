import Player from "../controllers/Player";
import logger from "../utils/logger";
import { CardType, Room, Side } from "../types";
import { HitPoints } from "../types/player";
import Match from "../controllers/Match";

export const play = (player: Player, cardIndex: number) => {
  logger.info("Player played a card", { cardIndex, playerId: player.id });

  if (!player.match) {
    player.emit("exit");
    return;
  }

  const cardToPlay = player.findCardByIndex(cardIndex);

  const tableUpdate = {
    [player.side!]: cardToPlay,
    [player.opposingSide]: null,
  };

  player.emit("table", tableUpdate);
  player.emit("pop", {
    damage: {
      [Side.Left]: 0,
      [Side.Right]: 0,
    },
    message: "",
  });

  player.match.play(player.side!, {
    index: cardIndex,
    card: player.findCardByIndex(cardIndex),
  });
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

  if (player.match && player.side) {
    player.match.players[player.side] = null;

    if (player.match.id in player.game.matches)
      player.game.removeMatch(player.match.id);
  }

  player.to(Room.QUEUE, "remove", player.id);

  player.game.removePlayer(player.id);
};

export const afterPlay = (
  player: Player,
  match: Match,
  damage: HitPoints,
  message: string
) => {
  player.emit("hand", player.hand);
  player.emit("pop", { damage, message });
  player.emit("table", match.cardsOnTable);
  player.emit("hitPoints", match.hitPoints);
};
