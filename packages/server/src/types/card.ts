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

export type FrameData = {
  startUp: number;
  blockAdvance: number;
  hitAdvance: number;
  active: number;
  recovery: number;
  stun: number;
};

export type Card = {
  image: string;
  guard: Guard;
  reach: Reach;
  weight: Weight;
};

export enum Room {
  QUEUE = "queue",
}
