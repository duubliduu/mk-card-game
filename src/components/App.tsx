import { useState } from "react";
import Card from "./Card";
import { CardType } from "../types/card";
import useSocket from "../hooks/useSocket";

function App() {
  const [stack, setStack] = useState<CardType[]>([]);
  const [hand, setHand] = useState<
    [CardType | null, CardType | null, CardType | null]
  >([null, null, null]);
  const [id, setId] = useState<string>();
  const [inTurn, setIntTurn] = useState<boolean>();
  const [hitPoints, setHitPoints] = useState<number>();

  const socketRef = useSocket({
    identify: (id: string) => setId(id),
    message: (message: string) => console.log("message", message),
    hand: (hand: [CardType, CardType, CardType]) => setHand(hand),
    play: (card: CardType) => {
      setStack((state) => [...state, card]);
    },
    inTurn: setIntTurn,
    hitPoints: setHitPoints,
  });

  const handlePlayCard = (index: number) => {
    if (!inTurn) {
      return;
    }
    socketRef.current?.emit("play", index);
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto py-10">
        <section>
          hitPoints: {hitPoints}
          <br />
          Your id: {id}
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

        <section className="columns-3" style={{ opacity: inTurn ? 1 : 0.5 }}>
          {hand.map((card, index) =>
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
