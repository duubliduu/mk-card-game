import React, { FunctionComponent, useRef } from "react";
import useDragging from "../hooks/useDragging";

type CardProps = {
  image: string;
  onDrop: () => void;
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
    <article
      style={{ transform, width: "200px" }}
      className={`rounded aspect-portrait bg-slate-200`}
    >
      <div
        ref={cardRef}
        className="rounded aspect-portrait bg-white p-2"
        style={{ visibility: selected ? "hidden" : "visible", width: "200px" }}
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
