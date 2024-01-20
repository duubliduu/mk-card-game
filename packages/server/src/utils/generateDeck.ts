import { CardType, Reach, Stance, Weight } from "../types";

const reaches: Reach[] = [
  Reach.Guard,
  Reach.Grapple,
  Reach.Punch,
  Reach.Knee,
  Reach.Kick,
  Reach.FireBall,
];

const stances: { [key in Reach]: Stance[] } = {
  [Reach.None]: [],
  [Reach.Guard]: [Stance.Mid, Stance.High],
  [Reach.Grapple]: [Stance.Mid],
  [Reach.Punch]: [Stance.Mid, Stance.High],
  [Reach.Knee]: [Stance.Mid],
  [Reach.Kick]: [Stance.Low, Stance.Mid, Stance.High, Stance.Air],
  [Reach.FireBall]: [Stance.Low, Stance.High],
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
  const deck: CardType[] = [];

  reaches.forEach((reach) => {
    stances[reach].forEach((stance) => {
      if (weights[reach].length > 0) {
        weights[reach].forEach((weight) => {
          deck.push({
            image: `${Reach[reach].toLowerCase()}-${Stance[
              stance
            ].toLowerCase()}-${Weight[weight].toLowerCase()}.png`,
            stance,
            reach,
            weight,
          });
        });
      } else {
        deck.push({
          image: `${Reach[reach].toLowerCase()}-${Stance[
            stance
          ].toLowerCase()}.png`,
          stance,
          reach,
          weight: 0,
        });
      }
    });
  });

  // Utility cards
  deck.push({
    image: "advance.png",
    stance: Stance.Mid,
    reach: Reach.None,
    weight: 0,
    move: 1,
  });
  deck.push({
    image: "evade.png",
    stance: Stance.Mid,
    reach: Reach.None,
    weight: 0,
    move: -1,
  });
  deck.push({
    image: "jump-neutral.png",
    stance: Stance.Air,
    reach: Reach.None,
    weight: 0,
    move: 0,
  });
  deck.push({
    image: "jump-backwards.png",
    stance: Stance.Air,
    reach: Reach.None,
    weight: 0,
    move: -1,
  });
  deck.push({
    image: "jump-forward.png",
    stance: Stance.Air,
    reach: Reach.None,
    weight: 0,
    move: 1,
  });

  return deck;
};

const deck = buildDeck();

const generateDeck = (): CardType[] => {
  return [...deck.sort(() => Math.random() - 0.5)];
};

export default generateDeck;
