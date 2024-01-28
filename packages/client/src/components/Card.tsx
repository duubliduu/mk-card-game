import React, { FunctionComponent, useRef } from "react";
import useDragging from "../hooks/useDragging";

type CardProps = {
  image: string;
  onDrop?: <T extends Event>(event: T) => void;
  onDrag?: <T extends Event>(event: T) => void;
  selected?: boolean;
  flip?: boolean;
};

const Card: FunctionComponent<CardProps> = ({
  image,
  onDrop,
  onDrag,
  selected = false,
  flip = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const transform = ""; //`rotate(${Math.random() * 2 - 1}deg)`;

  useDragging({
    ref: cardRef,
    onMouseUp: onDrop,
    onMouseMove: onDrag,
  });

  return (
    <article className={`rounded aspect-portrait`}>
      <div
        ref={cardRef}
        className="rounded aspect-portrait bg-white p-2 drop-shadow-md"
        style={{
          display: selected ? "none" : "",
          width: "200px",
          transform,
        }}
      >
        <div className="rounded aspect-portrait p-2 border border-slate-600">
          <img
            className={`${flip && "transform -scale-x-100"}`}
            alt={image}
            src={`/images/cards/${image}`}
          />
        </div>
      </div>
    </article>
  );
};

export default Card;
