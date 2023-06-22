import { FunctionComponent } from "react";
import { CardType, Pressure, Reach, Stance, Weight } from "../types";

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
