import React, { useContext, useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import { useNavigate, useParams } from "react-router-dom";
import { QueueContext } from "../context/QueueContext";
import { getClientCoordinates } from "../utils/getClientCoordinates";
import HitPoints from "../components/HitPoints";
import { MatchContext } from "../context/MatchContext";
import useAudio from "../hooks/useAudio";
import "../components/HitMarker.css";
import Arena from "../components/Arena";

function Match() {
  const { id, name } = useContext(QueueContext);
  const {
    handlePlay,
    handleExit,
    selectedCards,
    handleSelectCard,
    handleDeselectCard,
    hitPoints,
    side,
    opponent,
    cards,
    isLockedIn,
    isPlayed,
    isReady,
    handleJoinMatch,
    cardsInHand,
    results,
  } = useContext(MatchContext);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const intervalRef = useRef<Timer>();

  const navigate = useNavigate();

  const [result, setResult] = useState<number>(-1);
  const [isDragging, setIsDragging] = useState(false);

  const [playHeavyHitSound] = useAudio("/audio/hit-2.wav");
  const [playWhiffSound] = useAudio("/audio/whiff.mp3");
  const [playBlockSound] = useAudio("/audio/block.mp3");

  const isOverDropArea = (x: number, y: number) => {
    if (!dropAreaRef.current) return false;

    const { top, left } = dropAreaRef.current.getBoundingClientRect();

    return (
      x > left &&
      y > top &&
      x < left + dropAreaRef.current.clientWidth &&
      y < top + dropAreaRef.current.clientHeight
    );
  };

  const handleDrag = <T extends Event>(event: T) => {
    if (!dropAreaRef.current) return;

    setIsDragging(true);

    const [x, y] = getClientCoordinates(event);

    if (isOverDropArea(x, y)) {
      dropAreaRef.current.classList.add("border-gray-300");
    } else {
      dropAreaRef.current.classList.remove("border-gray-300");
    }
  };

  const handleDrop = (index: number) => {
    if (!dropAreaRef.current) return;

    setIsDragging(false);

    if (dropAreaRef.current.classList.contains("border-gray-300")) {
      if (selectedCards.length >= 3) return;
      handleSelectCard(index);
    } else {
      handleDeselectCard(index);
    }
  };

  const handleDragStart = () => {
    if (!dropAreaRef.current) return;
    setIsDragging(true);
  };

  const { id: matchId } = useParams();

  useEffect(() => {
    if (matchId) {
      handleJoinMatch(matchId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  return (
    <div className="bg-gray-100 container h-screen select-none flex flex-col">
      <section className="pt-2 px-2 flex justify-between">
        <button
          className="text-xs"
          onClick={() => {
            handleExit();
            navigate("/");
          }}
        >
          Exit
        </button>
        <button className="text-xs" disabled>
          Settings
        </button>
      </section>
      {id && (
        <HitPoints
          left={{
            name: name || id,
            hitPoints: hitPoints[side],
          }}
          right={{
            name: opponent.name || opponent.id || "No Enemy",
            hitPoints: opponent.side ? hitPoints[opponent.side] : 0,
          }}
        />
      )}
      <div>
        {/* ARENA */}
        {isReady && (
          <div className="absolute top-15 z-0">
            <section className="mb-8 mt-8 relative">
              <Arena />
            </section>
          </div>
        )}
        {/* TABLE */}
        <div
          className="container flex mx-auto"
          ref={dropAreaRef}
          style={{ height: "280px" }}
        >
          {selectedCards.map((cardIndex, index) => (
            <Card
              key={`${cardIndex}-${index}`}
              onDrop={() => handleDrop(cardIndex)}
              onDrag={handleDrag}
              onDragStart={handleDragStart}
              disabled={isLockedIn}
              {...cards[cardIndex]}
            />
          ))}
          {results.length === 0 && selectedCards.length === 0 && (
            <div className="absolute w-full text-center" style={{ top: "30%" }}>
              Drag your best three cards here!
            </div>
          )}
          {!isDragging && !isLockedIn && selectedCards.length > 2 && (
            <div
              className="absolute w-full flex justify-center z-20"
              style={{
                top: "26%",
              }}
            >
              <button
                disabled={isLockedIn}
                className="bg-white px-6 py-4 rounded cursor-pointer drop-shadow-lg"
                onClick={() => {
                  handlePlay();
                }}
              >
                Fight!
              </button>
            </div>
          )}
          {isLockedIn && (
            <div
              className="absolute w-full text-center py-4"
              style={{
                top: "26%",
                background:
                  "repeating-linear-gradient(-45deg, #ededed 0%, #ededed 1%, #fff 1%, #fff 4%)",
              }}
            >
              Waiting for opponent to play...
            </div>
          )}
        </div>
        {/* HAND */}
        <section
          className="container mt-4 flex mx-auto"
          style={{ width: "360px" }}
        >
          {cardsInHand.map((cardIndex, index) => (
            <Card
              key={`${cardIndex}-${index}`}
              onDrop={() => handleDrop(cardIndex)}
              onDrag={handleDrag}
              onDragStart={handleDragStart}
              rotation={0}
              {...cards[cardIndex]}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

export default Match;
