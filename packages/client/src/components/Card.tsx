import { FunctionComponent } from "react";
import { CardType, Guard, Pressure, Reach, Stance, Weight } from "../types";

type CardProps = {
  onClick?: () => void;
} & CardType;

const Card: FunctionComponent<CardProps> = ({
  stance,
  reach,
  weight,
  pressure,
  guard,
  onClick,
}) => (
  <article
    style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}
    className={`rounded border-slate-500 ${
      onClick ? "cursor-pointer" : ""
    } h-48 w-32 p-1 bg-white drop-shadow-md`}
    {...(onClick && { onClick })}
  >
    <div className="text-center rounded border-2 h-full flex flex-col justify-between p-2">
      <div>
        <em>{Pressure[pressure]}</em>
      </div>
      <div>
        {Guard[guard]} {Reach[reach]}
      </div>
      <div>
        {Weight[weight]} {Stance[stance]}
      </div>
    </div>
  </article>
);

export default Card;
