import { Attributes } from "../types/player";

const roll1d10 = () => Math.floor(Math.random() * 11);

const roll10d10 = () => {
  let score = 0;
  for (let i = 0; i < 10; i++) {
    score += roll1d10();
  }
  return score;
};

export const generateAttributes = (): Attributes => {
  return {
    strength: roll10d10(),
    stamina: roll10d10(),
    speed: roll10d10(),
    reach: roll10d10(),
    reflexes: roll10d10(),
    technique: roll10d10(),
  };
};
