import { useEffect, useState } from "react";
import Card from "./Card";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";

import { useNavigate, useParams } from "react-router-dom";
import Pop from "./Pop";

function Match() {
  const [stack, setStack] = useState<CardType[]>([]);
  const [hand, setHand] = useState<
    [CardType | null, CardType | null, CardType | null]
  >([null, null, null]);
  const [inTurn, setIntTurn] = useState<boolean>();
  const [hitPoints, setHitPoints] = useState<{ [side in Side]: number }>({
    [Side.Left]: 100,
    [Side.Right]: 100,
  });
  const [side, setSide] = useState<Side>(Side.Left);
  const [opposingSide, setOpposingSide] = useState<Side>(Side.Right);
  const [damage, setDamage] = useState<number[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  const navigate = useNavigate();
  const { id: matchId } = useParams();

  const socketRef = useSocket({
    message: (message: string) => console.log("message", message),
    hand: (hand: [CardType, CardType, CardType]) => setHand(hand),
    play: (card: CardType) => {
      setStack((state) => [...state, card]);
    },
    stack: setStack,
    inTurn: setIntTurn,
    hitPoints: setHitPoints,
    hurt: (payload) =>
      setDamage((state) => (payload ? [...state, payload] : state)),
    gameOver: (gameState?: "win" | "lose") => {
      if (gameState === "lose") {
        window.alert("You lose");
        navigate("/");
      } else if (gameState === "win") {
        window.alert("You win");
        navigate("/");
      } else {
        navigate("/");
      }
    },
    side: setSide,
    enter: (payload) => {
      console.log(payload);
      setIsReady(payload);
    },
    leave: () => setIsReady(false),
  });

  const handlePlayCard = (index: number) => {
    if (!isReady || !inTurn) {
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

  useEffect(() => {
    setOpposingSide(Number(!side));
  }, [side]);

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto py-4 px-4">
        <div>
          <a href="/">Exit</a>
        </div>
        <section className="flex justify-between flex-row">
          <div className="w-1/2 relative">
            <div
              className="h-2 absolute left-0"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[side]}%`,
              }}
            />
            <div
              className="h-2 absolute left-0"
              style={{
                background: "green",
                width: `${hitPoints[side]}%`,
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
                width: `${hitPoints[opposingSide]}%`,
              }}
            />
            <div
              className="h-2 absolute right-0"
              style={{
                background: "green",
                width: `${hitPoints[opposingSide]}%`,
              }}
            />
          </div>
        </section>
        <div className="py-4">
          <section className="relative h-60 flex justify-center items-center">
            {!isReady && <div>Waiting for opponent to join...</div>}
            {stack.map((card, index) => (
              <div
                key={index}
                className="absolute"
                style={{ bottom: 10 + index }}
              >
                <Card {...card} />
              </div>
            ))}
            {damage.map((item, index) => (
              <Pop key={index}>
                <div className="text-7xl font-bold">{item}</div>
              </Pop>
            ))}
          </section>
        </div>
        <section
          className="columns-3"
          style={{ opacity: isReady && inTurn ? 1 : 0.5 }}
        >
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

export default Match;
