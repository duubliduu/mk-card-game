import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MatchContext } from "../context/MatchContext";
import useAnimationFrame from "../hooks/useAnimationFrame";
import useCanvas from "../hooks/useCanvas";
import imageService from "../services/imageService";

const Arena: FunctionComponent = () => {
  const { results, side, opponent } = useContext(MatchContext);
  const timeRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ctxRef = useCanvas(canvasRef);

  useEffect(() => {
    timeRef.current = 0;
  }, [JSON.stringify(results)]);

  const animate = (deltaTime: number) => {
    if (!ctxRef.current) return;

    const canvas = ctxRef.current.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = ctxRef.current;

    timeRef.current += deltaTime;

    if (timeRef.current >= 3000) {
      timeRef.current = 0;
    }

    const frame = Math.floor(timeRef.current / 1000);

    if (frame > results.length - 1) return;

    const { gap = 20, [side]: left, [opponent.side!]: right } = results[frame];

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      imageService.findImage(left.image),
      width / 2 - width / 3,
      0,
      height * (25 / 35),
      height
    );
    ctx.drawImage(
      imageService.findImage(right.image),
      width / 2,
      0,
      height * (25 / 35),
      height
    );
  };

  useAnimationFrame(animate);

  if (opponent.side === undefined || side === undefined) return null;

  return (
    <div
      className="flex justify-center w-full border-2 aspect-video"
      style={{
        backgroundSize: "cover",
        backgroundImage: "url(/images/arena.png)",
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default Arena;
