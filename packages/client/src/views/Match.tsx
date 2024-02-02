import React, { useContext, useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import { useNavigate, useParams } from "react-router-dom";
import { MatchResult, Side } from "../types";
import { QueueContext } from "../context/QueueContext";
import { getClientCoordinates } from "../utils/getClientCoordinates";
import HitPoints from "../components/HitPoints";
import { MatchContext } from "../context/MatchContext";
import useAudio from "../hooks/useAudio";
import Timer from "../components/Timer";

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
    pops,
    opponent,
    cards,
    table,
    isLockedIn,
    isPlayed,
    isReady,
    handleJoinMatch,
    cardsInHand,
  } = useContext(MatchContext);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const intervalRef = useRef<Timer>();

  const navigate = useNavigate();

  const [result, setResult] = useState<number>(-1);
  const [isDragging, setIsDragging] = useState(false);

  const [playHitSound] = useAudio("/audio/hit.wav");
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

  const results = [
    {
      gap: 0,
      sound: "hit",
      [Side.Left]: {
        damage: 10,
        image: "punch-high-light.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-high.png",
      },
    },
    {
      gap: 2,
      sound: "hit",
      [Side.Left]: {
        damage: 10,
        image: "punch-mid-light.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-high.png",
      },
    },
    {
      gap: 4,
      sound: "hit-2",
      [Side.Left]: {
        damage: 10,
        image: "punch-mid-heavy.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-high.png",
      },
    },
    {
      gap: 6,
      sound: "hit",
      [Side.Left]: {
        damage: 10,
        image: "kick-low-light.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-high.png",
      },
    },
    {
      gap: 15,
      sound: "hit",
      [Side.Left]: {
        damage: 10,
        image: "kick-mid-heavy.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "evade.png",
      },
    },
    {
      gap: 25,
      sound: "hit-2",
      [Side.Left]: {
        damage: 10,
        image: "kick-high-heavy-2.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-mid.png",
      },
    },
    {
      gap: 25,
      sound: "whiff",
      [Side.Left]: {
        damage: 10,
        image: "advance.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-high.png",
      },
    },
    {
      gap: 5,
      sound: null,
      [Side.Left]: {
        damage: 10,
        image: "guard-mid.png",
      },
      [Side.Right]: {
        damage: 0,
        image: "guard-mid.png",
      },
    },
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setResult((result) => {
        if (result + 1 > results.length - 1) {
          return results.length - 1;
        }
        return result + 1;
      });
    }, 250);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (result === -1) return;
    switch (results[result].sound) {
      case "hit":
      case "hit-2":
        playHitSound();
        break;
      case "whiff":
        playWhiffSound();
        break;
      case "block":
        playBlockSound();
        break;
    }
  }, [result, playHitSound, playWhiffSound]);

  const handleRestart = () => {
    setResult(-1);
  };

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
      {isReady && (
        <section className="mb-8 mt-8 relative">
          <div className="flex justify-center w-full border-2 aspect-video">
            {results.map(
              ({ gap, [Side.Left]: left, [Side.Right]: right }, index) => (
                <div
                  className="flex justify-center"
                  onClick={handleRestart}
                  key={index}
                  style={{ display: result === index ? "flex" : "none" }}
                >
                  <div
                    className="aspect-portrait"
                    style={{ marginRight: `-${25 - gap}%` }}
                  >
                    <img alt="" src={`/images/cards/${left.image}`} />
                  </div>
                  <div
                    className="aspect-portrait"
                    style={{ marginLeft: `-${25 - gap}%` }}
                  >
                    <img
                      className="transform -scale-x-100"
                      alt=""
                      src={`/images/cards/${right.image}`}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}
      {/* TABLE */}
      <div
        className="container flex mx-auto"
        ref={dropAreaRef}
        style={{ height: "280px" }}
      >
        {selectedCards.map((cardIndex) => (
          <Card
            key={cardIndex}
            image={cards[cardIndex].image}
            onDrop={() => handleDrop(cardIndex)}
            onDrag={handleDrag}
            onDragStart={() => {
              handleDragStart();
            }}
            disabled={isLockedIn}
            weight={cards[cardIndex].weight}
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
              onClick={handlePlay}
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
        style={{ width: "320px" }}
      >
        {cardsInHand.map((cardIndex, index) => (
          <Card
            key={cardIndex}
            onDrop={() => handleDrop(cardIndex)}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            image={cards[cardIndex].image}
            rotation={(index - 2) * 4}
            weight={cards[cardIndex].weight}
          />
        ))}
      </section>
    </div>
  );
}

export default Match;
