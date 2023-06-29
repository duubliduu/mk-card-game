import { FunctionComponent } from "react";
import { CardType, Pressure, Reach, Stance, Weight } from "../types";

type CardProps = {
  onClick?: () => void;
  flip?: boolean;
} & CardType;

const Card: FunctionComponent<CardProps> = ({
  stance,
  reach,
  weight,
  pressure,
  flip = false,
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
      {pressure === Pressure.Defensive && (
        <img alt={""} src={`/images/cards/defending.png`} className="absolute" />
      )}
      <img
        className={`${flip && "transform -scale-x-100"}`}
        alt={""}
        src={`/images/cards/${Stance[stance].toLowerCase()}/${Weight[
          weight
        ].toLowerCase()}/${Reach[reach].toLowerCase()}.jpg`}
      />
    </div>
  </article>
);

export default Card;
