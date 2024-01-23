import { CardType, Reach, Guard, Weight } from "../types";

type DamageReachMap = {
  [key in Exclude<Reach, Reach.None | Reach.Guard | Reach.Grapple>]: number;
};

const damageReachMap: DamageReachMap = {
  [Reach.Punch]: 5,
  [Reach.Knee]: 10,
  [Reach.Kick]: 10,
  [Reach.FireBall]: 10,
};

const calculateDamage = (attacker: CardType) => {
  if (attacker.reach in damageReachMap) {
    // @ts-ignore
    return damageReachMap[attacker.reach] * attacker.weight;
  }
  return 0;
};

const isDefending = (card: CardType) => {
  return card.reach === Reach.Guard;
};

const isAttacking = (card: CardType): boolean => {
  return card.reach > Reach.Guard;
};

const isParry = (leftCArd: CardType, rightCard: CardType) => {
  return (
    leftCArd.reach === rightCard.reach && leftCArd.guard === rightCard.guard
  );
};

const isJumping = (card: CardType) => {
  return card.guard === Guard.Air;
};

const isCrouching = (card: CardType) => {
  return card.guard === Guard.Low;
};

const isHigh = (card: CardType) => {
  return card.guard === Guard.High;
};

const doesWhiff = (
  attackingCard: CardType,
  defendingCard: CardType
): boolean => {
  return (
    (isJumping(attackingCard) && isCrouching(defendingCard)) ||
    (isHigh(attackingCard) && isCrouching(defendingCard)) ||
    (isCrouching(attackingCard) && isJumping(defendingCard))
  );
};

const isLight = (card: CardType) => {
  return card.weight === Weight.Light;
};

const isHeavy = (card: CardType) => {
  return card.weight === Weight.Heavy;
};

const isStanding = (card: CardType) => {
  return card.guard === Guard.Mid || card.guard === Guard.High;
};

const inReach = (attackingCard: CardType, defendingCard: CardType) => {
  return attackingCard.reach >= defendingCard.reach;
};

// -1 they get the turn OR they get to go again
// 0 turn ends
// +1 you get the turn OR you get to go again
/**
 * returns [damage, endTurn, message]
 */
export const resolveDamage = (
  attackingCard: CardType,
  defendingCard: CardType
): { damage: number; endTurn: boolean; message: string } => {
  const defaults = { damage: 0, endTurn: true, message: "" };
  // If there's no defending card
  if (!defendingCard) {
    return { ...defaults, message: "Starter Card" };
  }

  // Setup trap card
  if (isDefending(attackingCard)) {
    return { ...defaults, message: "Guard!" };
  }

  // Both Defending
  if (isDefending(attackingCard) && isDefending(defendingCard)) {
    return { ...defaults, message: "Impasse" };
  }

  // Trigger trap card
  if (isAttacking(attackingCard) && isDefending(defendingCard)) {
    if (isParry(attackingCard, defendingCard)) {
      return {
        ...defaults,
        damage: -calculateDamage(defendingCard),
        message: "Parry!",
      };
    }

    if (
      doesWhiff(defendingCard, attackingCard) ||
      !inReach(defendingCard, attackingCard)
    ) {
      return { ...defaults, endTurn: false, message: "Block!" };
    }

    return {
      ...defaults,
      damage: -calculateDamage(defendingCard),
      message: "Counter!",
    };
  }

  if (doesWhiff(attackingCard, defendingCard)) {
    return { ...defaults, message: "Whiff!" };
  }

  if (!inReach(attackingCard, defendingCard)) {
    return { ...defaults, message: "Short!" };
  }

  // It's a hit
  // damage is depending on the weight
  // defines the start and recovery
  return {
    damage: calculateDamage(attackingCard),
    // Heavy attack stops the turn
    endTurn: isHeavy(attackingCard),
    message: `${Weight[attackingCard.weight]} hit!`,
  };
};
