import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Side } from "../types";
import HitMarker from "./HitMarker";
import { MatchContext } from "../context/MatchContext";
import { resolveTop } from "../utils/resolveTop";
import useAnimationFrame from "../hooks/useAnimationFrame";

const Arena: FunctionComponent = () => {
  const [resultIndex, setResultIndex] = useState<number>(-1);
  const { results, side, opponent } = useContext(MatchContext);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    timeRef.current = 0;
    setResultIndex(-1);
  }, [JSON.stringify(results)]);

  useAnimationFrame((deltaTime: number) => {
    timeRef.current += deltaTime;
    const frame = Math.floor(timeRef.current / 1000);
    if (frame < results.length) {
      setResultIndex(frame);
    }
  });

  if (opponent.side === undefined || side === undefined) return null;

  return (
    <div
      className="flex justify-center w-full border-2 aspect-video"
      style={{
        backgroundSize: "cover",
        backgroundImage: "url(/images/arena.png)",
      }}
    >
      {resultIndex === -1 && (
        <div className="flex justify-center relative">
          <div className="aspect-portrait" style={{ marginRight: `-25%` }}>
            <img alt="" src={`/images/cards/guard-mid.png`} />
          </div>
          <div className="aspect-portrait" style={{ marginLeft: `-25%` }}>
            <img
              className="transform -scale-x-100"
              alt=""
              src={`/images/cards/guard-mid.png`}
            />
          </div>
        </div>
      )}
      {results.map(
        ({ gap = 20, [side]: left, [opponent.side!]: right }, index) => (
          <div
            key={`${index}-${Math.random() * 1000}`}
            className="flex justify-center relative"
            style={{ display: resultIndex === index ? "flex" : "none" }}
          >
            <div
              className="aspect-portrait z-10"
              style={{ marginRight: `-${25 - gap}%` }}
            >
              <img
                alt=""
                src={`/images/cards/${left.image ?? "guard-high.png"}`}
              />
            </div>
            <div
              className="aspect-portrait z-10"
              style={{ marginLeft: `-${25 - gap}%` }}
            >
              <img
                className="transform -scale-x-100"
                alt={`Gap: ${gap}`}
                src={`/images/cards/${right.image ?? "guard-high.png"}`}
              />
            </div>
            <HitMarker
              key={index}
              delay={(1 + index) * 500}
              top={resolveTop(left)}
              right
            />
          </div>
        )
      )}
    </div>
  );
};

export default Arena;
