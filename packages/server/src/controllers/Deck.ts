import generateDeck from "../utils/generateDeck";
import { CardType } from "../types";

class Deck {
  cards: CardType[] = [];
  constructor() {
    this.cards = generateDeck();
    this.shuffle();
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  draw(numberOfCards: number) {
    const cards = this.cards.splice(0, numberOfCards);
    this.cards.push(...cards);
    return cards;
  }
}

export default Deck;
