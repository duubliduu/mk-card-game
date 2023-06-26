import AISocket from "./AISocket";
import logger from "./utils/logger";
import { CardType, Side } from "./types";

class AIClient {
  socket: AISocket;
  cardsAtHand: (CardType | null)[] = [null, null, null];
  isMyTurn: boolean = false;

  constructor(socket: AISocket) {
    this.socket = socket;
  }

  get randomCardIndex() {
    return Math.ceil(Math.random() * 3) - 1;
  }

  private takeTurn() {
    setTimeout(() => {
      const randomCardIndex = this.randomCardIndex;

      logger.info("AI plays random a card", { randomCardIndex });

      // Emit to backend
      this.socket.trigger("play", randomCardIndex);
    }, 2000);
  }

  inTurn(inTurn: boolean) {
    this.isMyTurn = inTurn;

    logger.info("AI inTurn is called", { inTurn });

    if (this.isMyTurn) {
      logger.info("It is the AI's turn");
      this.takeTurn();
    }
  }

  opponent() {
    // AI doesn't care about opponent
    logger.info("AI's opponent is ready! Will play starting card");

    this.takeTurn();
  }

  side(side: Side) {
    // AI doesn't care about side
    // WHy should anyone
    logger.info("AI side was called", { side });
  }

  gameOver() {
    // Leave the game on game over
    logger.info("AI gameOver was called");
  }

  hand(cards: (CardType | null)[]) {
    // At this point AI doesn't care about the cards
    this.cardsAtHand = cards;
  }

  hitPoints() {
    logger.info("AI hitPOitns was called");
  }

  stack() {
    // AI doesn't care about the stack either
    logger.info("AI stack was called");
  }

  play(cardToPlay: CardType) {
    // AI doesn't care about your card either
    logger.info("AI card to play", { cardToPlay });
  }

  pop() {
    logger.info("AI pop was called");
  }

  message() {
    logger.info("AI message was called");
  }
}

export default AIClient;
