import { CardType, Guard, Pressure, Reach, Stance, Weight } from "../types";

const guards = {
  [Guard.Air]: [
    [Stance.High],
    [Stance.High],
    [Stance.Mid, Stance.High],
    [Stance.Low, Stance.Mid, Stance.High],
  ],
  [Guard.Stand]: [
    [Stance.Mid, Stance.High], // grapple,
    [Stance.Mid, Stance.High], // punch,
    [Stance.Low, Stance.Mid, Stance.High], // kick,
    [Stance.Low, Stance.Mid, Stance.High], // fireball,
  ],
  [Guard.Crouch]: [
    [Stance.Low, Stance.Mid],
    [Stance.Low, Stance.Mid],
    [Stance.Low, Stance.Mid],
    [Stance.Low, Stance.Mid, Stance.High], // you can shoot where ever
  ],
} as { [key in Guard]: Stance[][] };

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

  (Object.entries(guards) as unknown as [Guard, Stance[][]][]).forEach(
    ([guard, stances]) => {
      reaches.forEach((reach) => {
        stances[reach].forEach((stance) => {
          weights.forEach((weight) => {
            pressures.forEach((pressure) => {
              deck.push({
                stance,
                reach,
                guard,
                weight,
                pressure,
              });
            });
          });
        });
      });
    }
  );

  return deck;
};

const deck = buildDeck();

const generateDeck = (): CardType[] => {
  return deck.sort(() => Math.random() - 0.5);
};

export default generateDeck;
