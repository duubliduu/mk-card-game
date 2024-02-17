import { Side } from "./card";

export type AttackResult = {
  gap: number;
  message: string;
  [Side.Left]: {
    damage: number;
  };
  [Side.Right]: {
    damage: number;
  };
};
