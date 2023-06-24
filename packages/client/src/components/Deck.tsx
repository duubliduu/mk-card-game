import { FunctionComponent } from "react";
import Card from "./Card";
import cards from "./cards.json";
import { CardType } from "../types";

const typedCards = cards as unknown as CardType[];

const Deck: FunctionComponent<{}> = () => {
  return (
    <div className="container px-4 py-4">
      <div className="flex flex-wrap">
        {typedCards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Deck;
