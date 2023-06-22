import { CardType } from "../types";

const generateDeck = (quantity: number = 50): CardType[] =>
  Array(quantity)
    .fill(null)
    .map(() => ({
      stance: Math.ceil(Math.random() * 3) - 1,
      reach: Math.ceil(Math.random() * 4) - 1,
      weight: Math.ceil(Math.random() * 3),
      pressure: Math.ceil(Math.random() * 3) - 2,
    }));

export default generateDeck;
