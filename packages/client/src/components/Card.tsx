import React, { FunctionComponent, useEffect, useRef } from "react";
import useDragging from "../hooks/useDragging";
import { Weight } from "../types";

type CardProps = {
  image: string;
  onDrop?: <T extends Event>(event: T) => void;
  onDrag?: <T extends Event>(event: T) => void;
  onDragStart?: <T extends Event>(event: T) => void;
  selected?: boolean;
  flip?: boolean;
  rotation?: number;
  disabled?: boolean;
  weight: Weight;
};

const borderMap = {
  [Weight.Light]: "border",
  [Weight.Medium]: "border-4",
  [Weight.Heavy]: "border-8",
};

const Card: FunctionComponent<CardProps> = ({
  image,
  onDrop,
  onDrag,
  onDragStart,
  selected = false,
  flip = false,
  rotation,
  disabled = false,
  weight,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDrag = <T extends Event>(event: T) => {
    if (!cardRef.current) return;

    if (typeof onDrag === "function") {
      onDrag(event);
    }
  };

  const [, isEnabled] = useDragging({
    ref: cardRef,
    onMouseDown: onDragStart,
    onMouseUp: onDrop,
    onMouseMove: handleDrag,
  });

  useEffect(() => {
    isEnabled.current = !disabled;
  }, [isEnabled, disabled]);

  return (
    <article style={{ width: rotation === undefined ? "23%" : "30px" }}>
      <div
        ref={cardRef}
        className="rounded aspect-portrait bg-white p-2 drop-shadow-md"
        style={{
          display: selected ? "none" : "",
          width: "200px",
          ...(rotation !== undefined && {
            marginTop: `${Math.abs(rotation)}px`,
          }),
          ...(rotation !== undefined && { rotate: `${rotation}deg` }),
        }}
      >
        <div
          className={`rounded aspect-portrait p-2 ${borderMap[weight]} border-slate-600 relative`}
        >
          <img
            className={`${flip && "transform -scale-x-100"}`}
            alt={image}
            src={`/images/cards/${image}`}
            style={{ opacity: disabled ? 0.5 : 1 }}
          />
        </div>
      </div>
    </article>
  );
};

export default Card;
