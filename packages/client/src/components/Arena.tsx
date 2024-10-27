import React, { FunctionComponent, useContext, useRef } from "react";
import { MatchContext } from "../context/MatchContext";
import useAnimationFrame from "../hooks/useAnimationFrame";
import useCanvas from "../hooks/useCanvas";
import imageService from "../services/imageService";

const Arena: FunctionComponent = () => {
  const { results, side, opponent } = useContext(MatchContext);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ctxRef = useCanvas(canvasRef);

  const update = async (frame: number) => {
    if (!ctxRef.current || results.length === 0) return;

    const canvas = ctxRef.current.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = ctxRef.current;

    if (!results[frame - 1]) return;

    const { [side]: left, [opponent.side!]: right } = results[frame - 1];

    ctx.clearRect(0, 0, width, height);
    imageService.findImage(left.image).then((image) => {
      ctx.drawImage(
        image,
        width / 2 - width / 3,
        0,
        height * (25 / 35),
        height
      );
    });

    imageService
      .findImage(right.image, (tool) => tool.flipH())
      .then((image) => {
        ctx.drawImage(image, width / 2, 0, height * (25 / 35), height);
      });
  };

  useAnimationFrame(update);
  // useAnimationFrame(update, results.length);

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
