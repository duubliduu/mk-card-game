import { RefObject, useCallback, useEffect, useRef } from "react";

type Props = {
  ref: RefObject<HTMLElement>;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseUp?: () => void;
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
    (event: MouseEvent) => {
      event.preventDefault();
      ref.current!.style.position = "absolute";
      isDragging.current = true;
      updateCardPosition(event.clientX, event.clientY);
      if (typeof onMouseDown === "function") onMouseDown(event);
    },
    [onMouseDown, ref, updateCardPosition]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging.current) return;
      updateCardPosition(event.clientX, event.clientY);
      if (typeof onMouseMove === "function") onMouseMove(event);
    },
    [updateCardPosition, onMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    ref.current!.style.position = "static";
    if (typeof onMouseUp === "function") onMouseUp();
  }, [onMouseUp, ref]);

  useEffect(() => {
    if (ref.current === null) return;

    const localRef = ref.current;

    localRef.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      localRef.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref, handleMouseDown, handleMouseMove, handleMouseUp]);

  return isDragging;
};

export default useDragging;
