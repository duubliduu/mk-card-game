import { FunctionComponent } from "react";
import { CardType } from "../types";

type CardProps = {
  image: string;
  onClick?: () => void;
  flip?: boolean;
} & CardType;

const Card: FunctionComponent<CardProps> = ({
  image,
  flip = false,
  onClick,
}) => (
  <article
    style={{ transform: `rotate(${Math.random() * 2 - 1}deg)` }}
    className={`rounded border-slate-500 ${
      onClick ? "cursor-pointer" : ""
    } aspect-portrait p-1 bg-white drop-shadow-md`}
    {...(onClick && { onClick })}
  >
    <div className="rounded bg-slate-200 border-2 border-slate-300 h-full flex flex-col justify-center p-2">
      <img
        className={`${flip && "transform -scale-x-100"}`}
        alt={`/images/cards/${image}`}
        src={`/images/cards/${image}`}
      />
    </div>
  </article>
);

export default Card;
