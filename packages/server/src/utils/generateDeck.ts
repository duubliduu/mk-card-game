import { CardType, Pressure, Reach, Stance, Weight } from "../types";

const stances = {
  [Reach.Grapple]: [Stance.Mid],
  [Reach.Punch]: [Stance.Low, Stance.Mid, Stance.High],
  [Reach.Kick]: [Stance.Low, Stance.Mid, Stance.High, Stance.Air],
  [Reach.FireBall]: [Stance.Low, Stance.High, Stance.Air],
};

const reaches = [Reach.Grapple, Reach.Punch, Reach.Kick, Reach.FireBall];

const weights = [Weight.Light, Weight.Medium, Weight.Heavy];

const pressures = [
  Pressure.Defensive,
  Pressure.Controlled,
  Pressure.Aggressive,
];

// Build deck with one card of each possible variation
export const buildDeck = () => {
  // initiate the dec
  const deck: CardType[] = [];

  reaches.forEach((reach) => {
    stances[reach].forEach((stance) => {
      weights.forEach((weight) => {
        pressures.forEach((pressure) => {
          deck.push({
            stance,
            reach,
            weight,
            pressure,
          });
        });
      });
    });
  });

  return deck;
};

const deck = buildDeck();

const generateDeck = (): CardType[] => {
  return [...deck.sort(() => Math.random() - 0.5)];
};

export default generateDeck;
