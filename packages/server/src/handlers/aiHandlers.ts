import AIClient from "../controllers/AIClient";
import logger from "../utils/logger";
import { randomCardIndex } from "../utils/general";

export function onChallenge(
  client: AIClient,
  payload: { [matchId: string]: string }
) {
  logger.info("AI received a challenge!");
  client.socket.emit("match", payload.matchId);
}

export function onOpponent(client: AIClient) {
  // AI doesn't care about opponent
  logger.info("AI's opponent is ready! Will play starting card");

  const cardIndex = randomCardIndex();

  logger.info("AI instantly plays the starting card", {
    cardIndex,
  });

  logger.info(`the type of client.socket ${typeof client.socket}`);

  client.socket.emit("play", cardIndex);
}

export function onInTurn(client: AIClient, inTurn: boolean) {
  client.isMyTurn = inTurn;

  logger.info("AI inTurn is called", { inTurn });

  if (client.isMyTurn) {
    logger.info("It is the AI's turn");

    setTimeout(() => {
      const cardIndex = randomCardIndex();

      logger.info("AI plays random a card", { cardIndex });

      // Emit to backend
      client.socket.emit("play", cardIndex);
    }, 2000);
  }
}

export function onLeave(client: AIClient) {
  logger.info("Player left the AI match");

  client.hasEnded = true;

  // Manually disconnect
  client.socket.disconnect();
}

export function onGameOver(client: AIClient) {
  // Leave the game on game over
  logger.info("AI game over was called");

  client.hasEnded = true;
  client.socket.emit("leave");

  // Manually disconnect
  client.socket.disconnect();
}

export function onDisconnect() {
  logger.info("AI disconnected");
}

export const onConnect = (client: AIClient) => {
  if (typeof client.handleReady === "function") {
    client.handleReady(client.socket);
  }
};
