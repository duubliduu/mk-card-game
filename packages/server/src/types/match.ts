import { Card, Side } from "./card";

export type AttackResult = {
  gap: number;
  message: string;
  [Side.Left]: {
    damage: number;
  } & Card;
  [Side.Right]: {
    damage: number;
  } & Card;
};
