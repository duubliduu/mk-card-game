import React, { FunctionComponent } from "react";

enum Stance {
  Low,
  Mid,
  High = 2,
}

enum Reach {
  Grapple,
  Punch,
  Kick,
  FireBall,
}

enum Weight {
  Light = 1,
  Medium,
  Heavy,
}

enum Pressure {
  Defensive = -1,
  Controlled,
  Aggressive,
}

export type CardType = {
  stance: Stance;
  reach: Reach;
  weight: Weight;
  pressure: Pressure;
};

type CardProps = {
  onClick?: () => void;
} & CardType;

const Card: FunctionComponent<CardProps> = ({
  stance,
  reach,
  weight,
  pressure,
  onClick,
}) => (
  <article
    style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}
    className="rounded border-slate-500 cursor-pointer h-48 px-2 py-2 bg-white drop-shadow-md"
    {...(onClick && { onClick: onClick })}
  >
    <div className="text-center">
      <em>{Pressure[pressure]}</em>
      <br />
      {Weight[weight]} {Stance[stance]} {Reach[reach]}
    </div>
  </article>
);

export default Card;
