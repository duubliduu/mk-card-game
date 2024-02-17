import generateDeck from "../utils/generateDeck";
import { Card } from "../types";

class Deck {
  cards: Card[] = [];
  playedCards: Card[] = [];

  get length() {
    return this.cards.length;
  }

  constructor() {
    this.cards = generateDeck();
    this.shuffle();
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  draw(numberOfCards: number): Card[] {
    if (this.length === 0) {
      this.reShuffle();
    }

    if (numberOfCards > this.length) {
      const drawnCards = this.draw(this.length);
      this.reShuffle();
      return [...drawnCards, ...this.draw(numberOfCards - this.cards.length)];
    }

    const cards = this.cards.splice(0, numberOfCards);
    this.playedCards.push(...cards);

    return cards;
  }

  reShuffle() {
    this.cards = [...this.playedCards];
    this.playedCards = [];
    this.shuffle();
  }

  get images(): string[] {
    return this.cards.map((card) => card.image);
  }
}

export default Deck;
