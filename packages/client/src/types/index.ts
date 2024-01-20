export enum Stance {
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
  stance: Stance;
  reach: Reach;
  weight: Weight;
};
