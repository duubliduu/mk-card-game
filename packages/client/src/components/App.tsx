import { useState } from "react";
import Card from "./Card";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";
import { punch } from "../utils/audio";

function App() {
  const [stack, setStack] = useState<CardType[]>([]);
  const [hand, setHand] = useState<
    [CardType | null, CardType | null, CardType | null]
  >([null, null, null]);
  const [inTurn, setIntTurn] = useState<boolean>();
  const [hitPoints, setHitPoints] = useState<{ [side in Side]: number }>({
    [Side.Left]: 100,
    [Side.Right]: 100,
  });

  const socketRef = useSocket({
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

    punch.play();

    socketRef.current?.emit("play", index);
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto py-4 px-4">
        <section className="columns-2">
          <div className="border-solid border border-sleight-500">
            <div
              className="h-2"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[Side.Left]}%`,
              }}
            />
          </div>
          <div className="border-solid border border-sleight-500">
            <div
              className="h-2"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[Side.Right]}%`,
              }}
            />
          </div>
        </section>
        <div className="py-4">
          <section className="relative h-60 flex justify-center items-center">
            {stack.map((card, index) => (
              <div
                key={index}
                className="absolute"
                style={{ bottom: 10 + index, zIndex: index * 100 }}
              >
                <Card {...card} />
              </div>
            ))}
          </section>
        </div>
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
