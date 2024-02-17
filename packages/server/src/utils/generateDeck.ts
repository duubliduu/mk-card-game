import { Card, Reach, Guard, Weight } from "../types";

const reaches: Reach[] = [
  Reach.Guard,
  Reach.Grapple,
  Reach.Punch,
  Reach.Knee,
  Reach.Kick,
  Reach.FireBall,
];

const stances: { [key in Reach]: Guard[] } = {
  [Reach.None]: [],
  [Reach.Guard]: [Guard.Mid, Guard.High],
  [Reach.Grapple]: [Guard.Mid],
  [Reach.Punch]: [Guard.Mid, Guard.High],
  [Reach.Knee]: [Guard.Mid],
  [Reach.Kick]: [Guard.Low, Guard.Mid, Guard.High, Guard.Air],
  [Reach.FireBall]: [Guard.Low, Guard.High],
};

const weights: { [key in Reach]: Weight[] } = {
  [Reach.None]: [],
  [Reach.Guard]: [],
  [Reach.Grapple]: [],
  [Reach.Punch]: [Weight.Light, Weight.Medium, Weight.Heavy],
  [Reach.Knee]: [Weight.Medium, Weight.Heavy],
  [Reach.Kick]: [Weight.Light, Weight.Medium, Weight.Heavy],
  [Reach.FireBall]: [],
};

// Build deck with one card of each possible variation
export const buildDeck = () => {
  // initiate the dec
  const deck: Card[] = [];

  reaches.forEach((reach) => {
    stances[reach].forEach((stance) => {
      if (weights[reach].length > 0) {
        weights[reach].forEach((weight) => {
          deck.push({
            image: `${Reach[reach].toLowerCase()}-${Guard[
              stance
            ].toLowerCase()}-${Weight[weight].toLowerCase()}.png`,
            guard: stance,
            reach,
            weight,
          });
        });
      } else {
        deck.push({
          image: `${Reach[reach].toLowerCase()}-${Guard[
            stance
          ].toLowerCase()}.png`,
          guard: stance,
          reach,
          weight: 0,
        });
      }
    });
  });

  // Utility cards
  // deck.push({
  //   image: "advance.png",
  //   guard: Guard.Mid,
  //   reach: Reach.None,
  //   weight: 0,
  //   move: 1,
  // });
  // deck.push({
  //   image: "evade.png",
  //   guard: Guard.Mid,
  //   reach: Reach.None,
  //   weight: 0,
  //   move: -1,
  // });
  // deck.push({
  //   image: "jump-neutral.png",
  //   guard: Guard.Air,
  //   reach: Reach.None,
  //   weight: 0,
  //   move: 0,
  // });
  // deck.push({
  //   image: "jump-backwards.png",
  //   guard: Guard.Air,
  //   reach: Reach.None,
  //   weight: 0,
  //   move: -1,
  // });
  // deck.push({
  //   image: "jump-forward.png",
  //   guard: Guard.Air,
  //   reach: Reach.None,
  //   weight: 0,
  //   move: 1,
  // });

  return deck;
};

const deck = buildDeck();

const generateDeck = (): Card[] => {
  return [...deck.sort(() => Math.random() - 0.5)];
};

export default generateDeck;
