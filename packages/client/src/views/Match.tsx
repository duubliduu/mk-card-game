import React, { useContext, useEffect, useState } from "react";
import Card from "../components/Card";
import { useNavigate, useParams } from "react-router-dom";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";
import { QueueContext } from "../context/QueueContext";
import { ModalContext } from "../context/ModalContext";
import { getClientCoordinates } from "../utils/getClientCoordinates";

function Match() {
  const { id, name } = useContext(QueueContext);
  const { setContent, setOpen } = useContext(ModalContext);

  const [opposingSide, setOpposingSide] = useState<Side>(Side.Right);
  const [table, setTable] = useState<{ [side in Side]: CardType | null }>({
    [Side.Left]: null,
    [Side.Right]: null,
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [hitPoints, setHitPoints] = useState<{ [side in Side]: number }>({
    [Side.Left]: 100,
    [Side.Right]: 100,
  });
  const [side, setSide] = useState<Side>(Side.Left);
  const [pops, setPops] = useState<{
    damage: { [Side.Left]: number; [Side.Right]: number };
    message: string;
  }>();
  const [isReady, setIsReady] = useState<boolean>();
  const [opponent, setOpponent] = useState<
    Partial<{ id: string; name: string }>
  >({});
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const dropSiteRef = React.useRef<HTMLDivElement>(null);

  useSocket({
    message: (message: string) => console.log("message", message),
    hand: (payload: CardType[]) => {
      console.log("hand", payload);
      setSelectedIndex(-1);
      setCards([...payload]);
    },
    table: (payload: any) => {
      console.log("table", payload);
      setTable(payload);
    },
    play: (payload: any) => {
      console.log("play", payload);
      setTable(payload);
    },
    hitPoints: setHitPoints,
    pop: setPops,
    side: setSide,
    ready: setIsReady,
    leave: () => setIsReady(false),
    opponent: setOpponent,
    exit: () => {
      navigate("/");
    },
    disconnect: () => {
      navigate("/");
    },
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
                emit("leaveMatch");
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
                emit("leaveMatch");
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

  const isOverDropSite = (x: number, y: number) => {
    if (!dropSiteRef.current) return false;

    const { top, left } = dropSiteRef.current.getBoundingClientRect();

    return (
      x > left &&
      y > top &&
      x < left + dropSiteRef.current.clientWidth &&
      y < top + dropSiteRef.current.clientHeight
    );
  };

  const handleDrag = <T extends Event>(event: T) => {
    if (!dropSiteRef.current) return;

    const [x, y] = getClientCoordinates(event);

    if (isOverDropSite(x, y)) {
      dropSiteRef.current.classList.add("border-gray-300");
    } else {
      dropSiteRef.current.classList.remove("border-gray-300");
    }
  };

  const handleDrop = (index: number) => {
    // :hand_on_mouth_laughing
    if (dropSiteRef.current?.classList.contains("border-gray-300")) {
      setSelectedIndex(index);
      emit("play", index);
    }
  };

  const handleExit = () => {
    emit("leaveMatch");
    navigate("/");
  };

  useEffect(() => {
    if (matchId) {
      emit("joinMatch", matchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOpposingSide(Number(!side));
  }, [side]);

  const { [side]: leftCard, [Number(!side) as Side]: rightCard } = table;
  const { damage, message } = pops ?? {};
  const { [side]: leftDamage, [Number(!side) as Side]: rightDamage } =
    damage ?? {};
  return (
    <div className="bg-gray-100 h-screen select-none">
      <div className="container mx-auto py-4 px-4">
        <div className="pb-4 flex justify-between">
          <button onClick={handleExit}>Exit</button>
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
            <div className="pt-4 text-sm">{opponent.name || opponent.id}</div>
          </div>
        </section>
        <div className="py-4">
          <section>
            {hasEnded && <div>The match has ended</div>}
            {isReady && !hasEnded && (
              <div className="relative flex justify-center">
                <div
                  className="flex h-64 justify-center w-full border-4"
                  ref={dropSiteRef}
                >
                  <div className="rounded aspect-portrait relative">
                    {leftCard && (
                      <img alt="" src={`/images/cards/${leftCard.image}`} />
                    )}
                    <div
                      className="absolute w-full text-center"
                      style={{
                        top: `${60 - 20 * (rightCard?.guard ?? 0)}px`,
                      }}
                    >
                      {!!leftDamage && leftDamage}
                    </div>
                  </div>
                  <div className="rounded aspect-portrait relative">
                    {rightCard && (
                      <>
                        <img
                          className="transform -scale-x-100"
                          alt=""
                          src={`/images/cards/${rightCard.image}`}
                        />
                        <div
                          className="absolute w-full text-center"
                          style={{
                            top: `${60 - 20 * (rightCard?.guard ?? 0)}px`,
                          }}
                        >
                          {!!rightDamage && rightDamage}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="absolute top-0">{message}</div>
                </div>
              </div>
            )}
          </section>
        </div>
        <section
          className="flex justify-around"
          style={{ opacity: isReady === true ? 1 : 0.5 }}
        >
          {cards.map((card, cardIndex) => (
            <Card
              key={cardIndex}
              onDrop={() => handleDrop(cardIndex)}
              onDrag={handleDrag<Event>}
              selected={cardIndex === selectedIndex}
              image={card.image}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

export default Match;
