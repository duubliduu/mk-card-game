export enum Guard {
  Low,
  Mid,
  High,
  Air,
}

export enum Reach {
  None,
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

export type AttackResult = {
  gap: number;
  message: string;
  [Side.Left]: {
    damage: number;
  } & CardType;
  [Side.Right]: {
    damage: number;
  } & CardType;
};
