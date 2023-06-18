import { useEffect, useState } from "react";
import { CardType } from "./Card";

const generateDeck = (): CardType[] =>
  Array(10)
    .fill(null)
    .map(() => ({
      reach: Math.ceil(Math.random() * 3),
      weight: Math.ceil(Math.random() * 3),
      balance: Math.ceil(Math.random() * 3),
    }));

const separateFirstItem = (items: any[]) => {
  const [first, ...rest] = items;
  return [first, rest];
};

const useDeck = (): [CardType[], () => CardType] => {
  const [cards, setCards] = useState<CardType[]>([]);

  useEffect(() => {
    const generatedCards = generateDeck();
    setCards(generatedCards);
  }, []);

  const drawCards = (): CardType => {
    const [first, rest] = separateFirstItem(cards);

    setCards(rest);

    return first;
  };

  return [cards, drawCards];
};

export default useDeck;
