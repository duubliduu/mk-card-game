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
  const offset = useRef({ x: 0, y: 0 });
  const isEnabled = useRef(false);

  const updateCardPosition = useCallback(
    (x: number, y: number) => {
      if (!ref.current) return;
      // TODO: relative to width nad height
      ref.current.style.top = `${y + offset.current.y}px`;
      ref.current.style.left = `${x + offset.current.x}px`;
    },
    [ref, offset]
  );

  const handleMouseDown = useCallback(
    <T extends Event>(event: T) => {
      event.preventDefault();
      if (!ref.current) return;
      if (!isEnabled.current) return;

      const [x, y] = getClientCoordinates<T>(event);
      const { left, top } = ref.current.getBoundingClientRect();

      ref.current.style.position = "absolute";
      ref.current.style.zIndex = "99999";

      isDragging.current = true;

      offset.current = { x: left - x, y: top - y };

      updateCardPosition(x, y);

      if (typeof onMouseDown === "function") onMouseDown<T>(event);
    },
    [onMouseDown, ref, updateCardPosition, offset]
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

      offset.current = { x: 0, y: 0 };

      isDragging.current = false;

      ref.current!.style.position = "static";
      ref.current!.style.zIndex = "auto";

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

  return [isDragging, isEnabled];
};

export default useDragging;
