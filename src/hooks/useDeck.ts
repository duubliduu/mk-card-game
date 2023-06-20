import { useEffect, useState } from "react";
import { CardType } from "../components/Card";
import generateDeck from "../utils/generateDeck";

const separateFirstItem = (items: any[]) => {
  const [first, ...rest] = items;
  return [first, rest];
};

const useDeck = (): [CardType[], CardType[], (index: number) => void] => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [hand, setHand] = useState<CardType[]>([]);

  useEffect(() => {
    const generatedCards = generateDeck();

    const [first, second, third, ...rest] = generatedCards;

    setHand([first, second, third]);
    setCards(rest);
  }, []);

  const drawCard = (index: number) => {
    const [first, rest] = separateFirstItem(cards);

    setCards(rest);

    const tempHand = [...hand];
    tempHand[index] = first;

    setHand([...tempHand]);
  };

  return [cards, hand, drawCard];
};

export default useDeck;
