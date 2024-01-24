import {
  FunctionComponent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  ref: RefObject<HTMLElement>;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseUp?: () => void;
};

const useDragging = ({ ref, onMouseDown, onMouseMove, onMouseUp }: Props) => {
  const isDragging = useRef(false);

  const updateCardPosition = (x: number, y: number) => {
    // TODO: relative to width nad height
    ref.current!.style.top = `${y - 100}px`;
    ref.current!.style.left = `${x - 100}px`;
  };

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    ref.current!.style.position = "absolute";
    isDragging.current = true;
    updateCardPosition(event.clientX, event.clientY);
    if (typeof onMouseDown === "function") onMouseDown(event);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.current) return;
    updateCardPosition(event.clientX, event.clientY);
    if (typeof onMouseMove === "function") onMouseMove(event);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    ref.current!.style.position = "static";
    if (typeof onMouseUp === "function") onMouseUp();
  };

  useEffect(() => {
    if (ref.current === null) return;

    ref.current?.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      ref.current?.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref]);

  return isDragging;
};

export default useDragging;
