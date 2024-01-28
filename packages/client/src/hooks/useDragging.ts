import { RefObject, useCallback, useEffect, useRef } from "react";
import { getClientCoordinates } from "../utils/getClientCoordinates";

type Props = {
  ref: RefObject<HTMLElement>;
  onMouseDown?: <T extends Event>(event: T) => void;
  onMouseMove?: <T extends Event>(event: T) => void;
  onMouseUp?: <T extends Event>(event: T) => void;
};

const useDragging = ({ ref, onMouseDown, onMouseMove, onMouseUp }: Props) => {
  const isDragging = useRef(false);

  const updateCardPosition = useCallback(
    (x: number, y: number) => {
      // TODO: relative to width nad height
      ref.current!.style.top = `${y - 100}px`;
      ref.current!.style.left = `${x - 100}px`;
    },
    [ref]
  );

  const handleMouseDown = useCallback(
    <T extends Event>(event: T) => {
      event.preventDefault();
      ref.current!.style.position = "absolute";
      isDragging.current = true;

      const [x, y] = getClientCoordinates<T>(event);
      updateCardPosition(x, y);

      if (typeof onMouseDown === "function") onMouseDown<T>(event);
    },
    [onMouseDown, ref, updateCardPosition]
  );

  const handleMouseMove = useCallback(
    <T extends Event>(event: T) => {
      if (!isDragging.current) return;

      const [x, y] = getClientCoordinates<T>(event);
      updateCardPosition(x, y);

      if (typeof onMouseMove === "function") onMouseMove<T>(event);
    },
    [updateCardPosition, onMouseMove]
  );

  const handleMouseUp = useCallback(
    <T extends Event>(event: T) => {
      if (!isDragging.current) return;

      isDragging.current = false;

      ref.current!.style.position = "static";

      if (typeof onMouseUp === "function") onMouseUp(event);
    },
    [onMouseUp, ref]
  );

  useEffect(() => {
    if (ref.current === null) return;

    const localRef = ref.current;

    // mouse
    localRef.addEventListener("mousedown", handleMouseDown<MouseEvent>);
    document.addEventListener("mousemove", handleMouseMove<MouseEvent>);
    document.addEventListener("mouseup", handleMouseUp<MouseEvent>);
    // touch
    localRef.addEventListener("touchstart", handleMouseDown<TouchEvent>);
    document.addEventListener("touchmove", handleMouseMove<TouchEvent>);
    document.addEventListener("touchend", handleMouseUp<TouchEvent>);

    return () => {
      localRef.removeEventListener("mousedown", handleMouseDown<MouseEvent>);
      document.removeEventListener("mousemove", handleMouseMove<MouseEvent>);
      document.removeEventListener("mouseup", handleMouseUp<MouseEvent>);

      localRef.removeEventListener("touchstart", handleMouseDown<TouchEvent>);
      document.removeEventListener("touchmove", handleMouseMove<TouchEvent>);
      document.removeEventListener("touchend", handleMouseUp<TouchEvent>);
    };
  }, [ref, handleMouseDown, handleMouseMove, handleMouseUp]);

  return isDragging;
};

export default useDragging;
