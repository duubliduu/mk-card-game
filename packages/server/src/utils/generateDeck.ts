import { CardType, Guard, Pressure, Reach, Stance, Weight } from "../types";

const generateDeck = (): CardType[] => {
  const deck = buildDeck();
  deck.sort(() => Math.random() - 0.5);
  return deck;
};

export default generateDeck;

const guards = {
  [Guard.Air]: [Stance.Mid, Stance.High],
  [Guard.Stand]: [Stance.Low, Stance.Mid, Stance.High],
  [Guard.Crouch]: [Stance.Low, Stance.Mid],
} as { [key in Guard]: Stance[] };

const reaches = [Reach.Grapple, Reach.Punch, Reach.Kick, Reach.FireBall];

const weights = [Weight.Light, Weight.Medium, Weight.Heavy];

const pressures = [
  Pressure.Defensive,
  Pressure.Controlled,
  Pressure.Aggressive,
];

// Build deck with one card of each possible variation
const buildDeck = () => {
  // initiate the dec
  const deck: CardType[] = [];

  (Object.entries(guards) as unknown as [Guard, Stance[]][]).forEach(
    ([guard, stances]) => {
      stances.forEach((stance) => {
        reaches.forEach((reach) => {
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
