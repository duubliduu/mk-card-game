import { useEffect, useState } from "react";
import Card from "./Card";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";

import { useNavigate, useParams } from "react-router-dom";

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
  const [side, setSide] = useState<Side>();

  const navigate = useNavigate();

  const { id: matchId } = useParams();

  const socketRef = useSocket({
    message: (message: string) => console.log("message", message),
    hand: (hand: [CardType, CardType, CardType]) => setHand(hand),
    play: (card: CardType) => {
      setStack((state) => [...state, card]);
    },
    inTurn: setIntTurn,
    hitPoints: setHitPoints,
    gameOver: (gameState?: string) => {
      if (gameState === "lose") {
        window.alert("You lose");
        navigate("/");
      } else if (gameState === "win") {
        window.alert("You win");
        navigate("/");
      }
    },
    side: setSide,
  });

  const handlePlayCard = (index: number) => {
    if (!inTurn) {
      return;
    }

    socketRef.current?.emit("play", index);
  };

  useEffect(() => {
    if (matchId) {
      socketRef.current?.emit("match", matchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gray-100 h-screen">
      <div>Side {side}</div>
      <div className="container mx-auto py-4 px-4">
        <section className="flex justify-between flex-row">
          <div className="w-1/2 relative">
            <div
              className="h-2 absolute left-0"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[Side.Left]}%`,
              }}
            />
            <div
              className="h-2 absolute left-0"
              style={{
                background: "green",
                width: `${hitPoints[Side.Left]}%`,
              }}
            />
          </div>
          <div>VS.</div>
          <div className="w-1/2 flex justify-end relative">
            <div
              className="h-2 absolute right-0"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[Side.Right]}%`,
              }}
            />
            <div
              className="h-2 absolute right-0"
              style={{
                background: "green",
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
