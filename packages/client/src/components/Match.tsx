import React, { useContext, useEffect, useState } from "react";
import Card from "./Card";
import { useNavigate, useParams } from "react-router-dom";
import Pop from "./Pop";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";
import { QueueContext } from "../context/QueueContext";
import { ModalContext } from "../context/ModalContext";

function Match() {
  const { id, name } = useContext(QueueContext);
  const { setContent, setOpen } = useContext(ModalContext);

  const [opposingSide, setOpposingSide] = useState<Side>(Side.Right);
  const [stack, setStack] = useState<CardType[]>([]);
  const [hand, setHand] = useState<
    [CardType | null, CardType | null, CardType | null]
  >([null, null, null]);
  const [inTurn, setIntTurn] = useState<boolean>(false);
  const [hitPoints, setHitPoints] = useState<{ [side in Side]: number }>({
    [Side.Left]: 100,
    [Side.Right]: 100,
  });
  const [side, setSide] = useState<Side>(Side.Left);
  const [pops, setPops] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean | undefined>();
  const [opponent, setOpponent] = useState<
    Partial<{ id: string; name: string }>
  >({});
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  useSocket({
    message: (message: string) => console.log("message", message),
    hand: setHand,
    play: (card: CardType) => {
      setStack((state) => [...state, card]);
    },
    stack: setStack,
    inTurn: setIntTurn,
    hitPoints: setHitPoints,
    pop: (payload) =>
      setPops((state) => (payload ? [...state, payload] : state)),
    side: setSide,
    enter: setIsReady,
    leave: () => setIsReady(false),
    opponent: setOpponent,
  });

  const { id: matchId } = useParams();

  const emit = useSocket({
    gameOver: (gameState?: "win" | "lose") => {
      setHasEnded(true);
      if (gameState === "lose") {
        setContent(
          <div className="flex flex-col h-full justify-around items-center">
            <h1 className="text-4xl">You Lose!</h1>
            <button
              className="rounded bg-red-700 text-white py-3 px-6 font-bold"
              onClick={() => {
                setOpen(false);
                emit("leave");
                navigate("/");
              }}
            >
              OK
            </button>
          </div>
        );
        setOpen(true);
      } else if (gameState === "win") {
        setContent(
          <div className="flex flex-col h-full justify-around items-center">
            <h1 className="text-4xl">You win!</h1>
            <button
              className="rounded bg-red-700 text-white py-3 px-6 font-bold"
              onClick={() => {
                setOpen(false);
                emit("leave");
                navigate("/");
              }}
            >
              OK
            </button>
          </div>
        );
        setOpen(true);
      } else {
        navigate("/");
      }
    },
  });

  const navigate = useNavigate();

  const handlePlayCard = (index: number) => {
    if (!isReady || !inTurn || hasEnded) {
      return;
    }

    emit("play", index);
  };

  const handleSendChallenge = () => {
    if (typeof navigator.share !== "function") {
      return; // The share method works only with SSL
    }
    return navigator.share({
      url: window.location.href,
      text: "Take me on in CARD-FIGHTER-GAME!",
      title: "CHALLENGE | Combat Cards",
    });
  };

  const handleExit = () => {
    emit("leave", matchId);
    navigate("/");
  };

  useEffect(() => {
    if (matchId) {
      emit("match", matchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOpposingSide(Number(!side));
  }, [side]);

  return (
    <div className="bg-gray-100 h-screen">
      <div className="container mx-auto py-4 px-4">
        <div className="pb-4 flex justify-between">
          <button onClick={handleExit}>Exit</button>
          <button onClick={handleSendChallenge}>Send a CHALLENGE</button>
        </div>
        <section className="flex justify-between flex-row">
          <div className="w-1/2 relative">
            <div
              className="h-4 absolute left-0"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[side]}%`,
              }}
            />
            <div
              className="h-4 absolute left-0"
              style={{
                background: "green",
                width: `${hitPoints[side]}%`,
              }}
            />
            <div className="pt-4 text-sm">{name || id}</div>
          </div>
          <div className="px-2 italic">VS</div>
          <div className="w-1/2 flex justify-end relative">
            <div
              className="h-4 absolute right-0"
              style={{
                background: "red",
                transition: "width 1s",
                width: `${hitPoints[opposingSide]}%`,
              }}
            />
            <div
              className="h-4 absolute right-0"
              style={{
                background: "green",
                width: `${hitPoints[opposingSide]}%`,
              }}
            />
            <div className="pt-4 text-sm">{opponent.name || opponent.name}</div>
          </div>
        </section>
        <div className="py-4">
          <section className="relative h-60 flex justify-center items-center">

            {hasEnded && <div>The match has ended</div>}
            {isReady === undefined && (
              <div>Waiting for opponent to join...</div>
            )}
            {isReady === false && <div>Opponent left</div>}
            {isReady &&
              !hasEnded &&
              stack.map((card, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{ bottom: 10 + index }}
                >
                  <Card {...card} />
                </div>
              ))}
            {pops.map((item, index) => (
              <Pop
                key={index}
                sfx={isNaN(item as unknown as number) ? "whiff" : "hit"}
              >
                <div
                  className="font-bold align-center"
                  style={{ fontSize: "10vw" }}
                >
                  {item}
                </div>
              </Pop>
            ))}
          </section>
        </div>
        <section
          className="flex justify-around"
          style={{ opacity: isReady && !hasEnded && inTurn ? 1 : 0.5 }}
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
