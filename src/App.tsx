import React, { useEffect, useState } from "react";
import Card, { CardType } from "./Card";
import useDeck from "./useDeck";
import { resolveScore } from "./resolveScore";

function App() {
  const [stack, setStack] = useState<CardType[]>([]);
  const [score, setScore] = useState(0);
  const [myHand, setMyHand] = useState<(CardType | null)[]>([null, null, null]);

  const [myDeck, drawForMe] = useDeck();
  const [theirDeck, drawForThem] = useDeck();

  const handlePlayCard = (index: number) => {
    const cardToPlay = myHand[index];

    if (!cardToPlay) {
      return;
    }

    // play the card
    setStack((state) => [cardToPlay, ...state]);

    // update my hand
    const tempHand = [...myHand];
    tempHand[index] = null;

    setMyHand(tempHand);
  };

  const handleDrawCard = (index: number) => {
    // Draw a card for me
    const newHand = [...myHand];
    newHand[index] = drawForMe();
    setMyHand(newHand);
  };

  useEffect(() => {
    const [lastPlayed] = stack;

    const theirHand = [drawForThem(),drawForThem(),drawForThem()]

    const [theirCard] = theirHand;

    setScore((state) => state + resolveScore(lastPlayed, theirCard));
  }, [stack]);

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto">
        <section className="columns-3 py-4">
          <article className="h-48">
            {score}
          </article>
          {stack[0] && <Card {...stack[0]} />}
          <article  className="h-48">
            {score}
          </article>
        </section>
        <section className="columns-3">
          {myHand.map((card, index) =>
            card ? (
              <Card
                onClick={() => handlePlayCard(index)}
                key={index}
                {...card}
              />
            ) : (
              <article
                  key={index}
                onClick={() => handleDrawCard(index)}
                className="px-2 py-2 h-48 cursor-pointer"
              >
                Draw card
              </article>
            )
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
