import React, { useState } from "react";
import Card, { CardType } from "./Card";
import useDeck from "../hooks/useDeck";
import { resolveDamage } from "../utils/resolveDamage";
import useHitPoints from "../hooks/useHitPoints";
import { punch } from "../utils/audio";

function App() {
  const [stack, setStack] = useState<CardType[]>([]);
  const [turn, setTurn] = useState(0);

  const [, myHand, drawForMe] = useDeck();
  const [, theirHand, drawForThem] = useDeck();

  const [myHitPoints, takeDamage] = useHitPoints();
  const [theirHitPoints, dealDamage] = useHitPoints();

  const handlePlayCard = (index: number) => {
    if (turn === 0) {
      const cardToPlay = theirHand[index];

      if (!cardToPlay) {
        return;
      }

      setStack((state) => [...state, cardToPlay]);

      drawForThem(index);

      const [damage, endTurn] = resolveDamage(
        cardToPlay,
        stack[stack.length - 1]
      );

      if (endTurn) {
        setTurn(1);
      }

      if (damage > 0) {
        takeDamage(damage);
        punch.play();
      }
    } else {
      const cardToPlay = myHand[index];

      if (!cardToPlay) {
        return;
      }

      setStack((state) => [...state, cardToPlay]);

      drawForMe(index);

      const [damage, endTurn] = resolveDamage(
        cardToPlay,
        stack[stack.length - 1]
      );

      if (endTurn) {
        setTurn(0);
      }

      if (damage > 0) {
        dealDamage(damage);
        punch.play();
      }
    }
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto py-10">
        <section>
          {myHitPoints} vs {theirHitPoints}
        </section>
        <section
          className="columns-3"
          style={{ opacity: turn === 0 ? 1 : 0.5 }}
        >
          {theirHand.map((card, index) =>
            card ? (
              <Card
                onClick={() => handlePlayCard(index)}
                key={index}
                {...card}
              />
            ) : (
              <article key={index} className="px-2 py-2 h-48 cursor-pointer">
                No card
              </article>
            )
          )}
        </section>

        <section className="relative h-60 flex justify-center">
          {stack.map((card, index) => (
            <div
              key={index}
              className="absolute"
              style={{ top: index * -1, zIndex: index * 100 }}
            >
              <Card {...card} />
            </div>
          ))}
        </section>

        <section
          className="columns-3"
          style={{ opacity: turn === 1 ? 1 : 0.5 }}
        >
          {myHand.map((card, index) =>
            card ? (
              <Card
                onClick={() => handlePlayCard(index)}
                key={index}
                {...card}
              />
            ) : (
              <article key={index} className="px-2 py-2 h-48 cursor-pointer">
                No card
              </article>
            )
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
