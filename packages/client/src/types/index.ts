import * as string_decoder from "string_decoder";

export enum Guard {
  Low,
  Mid,
  High,
  Air,
}

export enum Reach {
  None,
  Guard,
  Grapple,
  Punch,
  Knee,
  Kick,
  FireBall,
}

export enum Weight {
  Light = 1,
  Medium,
  Heavy,
}

export enum Side {
  Left,
  Right,
}

export type CardType = {
  image: string;
  move?: number;
  guard: Guard;
  reach: Reach;
  weight: Weight;
};

export type MatchResult = {
  [key in Side]: {
    damage: number;
    image: string;
  };
};
