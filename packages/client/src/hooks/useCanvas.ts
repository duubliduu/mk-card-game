import { useRef, useEffect, MutableRefObject } from "react";

const useCanvas = (canvasRef: MutableRefObject<HTMLCanvasElement | null>) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>();

  useEffect(() => {
    if (!canvasRef.current) return;

    ctxRef.current = canvasRef.current.getContext("2d");
  }, [canvasRef]);

  return ctxRef;
};

export default useCanvas;
