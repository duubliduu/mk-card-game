export enum Stance {
  Low,
  Mid,
  High,
}

export enum Reach {
  Grapple,
  Punch,
  Kick,
  FireBall,
}

export enum Weight {
  Light = 1,
  Medium,
  Heavy,
}

export enum Pressure {
  Defensive = -1,
  Controlled,
  Aggressive,
}

export enum Side {
  Left,
  Right,
}

export enum Guard {
  Crouch,
  Stand,
  Air,
}

export type CardType = {
  stance: Stance;
  guard: Guard;
  reach: Reach;
  weight: Weight;
  pressure: Pressure;
};
