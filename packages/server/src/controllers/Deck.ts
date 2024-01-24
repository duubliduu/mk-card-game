import generateDeck from "../utils/generateDeck";
import { CardType } from "../types";

class Deck {
  cards: CardType[] = [];
  playedCards: CardType[] = [];

  constructor() {
    this.cards = generateDeck();
    this.shuffle();
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  draw(numberOfCards: number): CardType[] {
    if (numberOfCards > this.cards.length) {
      const drawnCards = this.draw(this.cards.length);
      this.reShuffle();
      return [...drawnCards, ...this.draw(numberOfCards - this.cards.length)];
    }
    const cards = this.cards.splice(0, numberOfCards);
    this.playedCards.push(...cards);

    if (this.cards.length === 0) {
      this.reShuffle();
    }

    return cards;
  }

  reShuffle() {
    this.cards = [...this.playedCards];
    this.playedCards = [];
    this.shuffle();
  }
}

export default Deck;
