import { Side } from "../types";

export const randomCardIndex = (): number => {
  return Math.ceil(Math.random() * 3) - 1;
};

export const flipSide = (side: Side): Side => {
  return Number(!side) as Side;
};
