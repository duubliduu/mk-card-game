import React, { FunctionComponent } from "react";

export type CardType = {
  reach: number;
  weight: number;
  balance: number;
};

type CardProps = {
  onClick?: () => void;
} & CardType;

const Card: FunctionComponent<CardProps> = ({
  reach,
  weight,
  balance,
  onClick,
}) => (
  <article
    className="rounded border-slate-500 cursor-pointer h-48 px-2 py-2 bg-white drop-shadow-md"
    {...(onClick && { onClick: onClick })}
  >
    <ul>
      <li>reach {reach}</li>
      <li>weight {weight}</li>
      <li>balance {balance}</li>
    </ul>
    {onClick && "Play this card"}
  </article>
);

export default Card;
