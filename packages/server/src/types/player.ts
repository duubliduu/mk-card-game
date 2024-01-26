import { Side } from "./index";

export type Attributes = {
  strength: number;
  stamina: number;
  speed: number;
  reach: number;
  reflexes: number;
  technique: number;
};

export type HitLocations = {
  head: number;
  body: number;
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
};

export type HitPoints = { [side in Side]: number };
