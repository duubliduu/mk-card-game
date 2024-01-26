import Deck from "../../src/controllers/Deck";
import { CardType } from "../../src/types";

describe("Deck", () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  describe("when created", () => {
    it("should have 25 cards", () => {
      expect(deck.length).toBe(25);
    });
  });

  describe("when cards are drawn", () => {
    let cards: CardType[] = [];

    beforeEach(() => {
      cards = deck.draw(20);
    });

    it("should have 20 cards", () => {
      expect(cards.length).toBe(20);
    });

    it("should have 5 cards left", () => {
      expect(deck.length).toBe(5);
    });

    describe("but cards run out", () => {
      beforeEach(() => {
        const numberOfCards = deck.length;
        cards = deck.draw(numberOfCards + 5);
      });

      it("should reshuffle the deck", () => {
        expect(deck.length).toBe(25);
      });
    });
  });
});
