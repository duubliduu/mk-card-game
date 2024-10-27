import { CardType, Guard } from "../types";

const TopMap = new Map<Guard, number>([
  [Guard.Low, 10],
  [Guard.Mid, 20],
  [Guard.High, 30],
  [Guard.Air, 40],
]);

export const resolveTop = (card: CardType): number => {
  return TopMap.get(card.guard) || 0;
};
