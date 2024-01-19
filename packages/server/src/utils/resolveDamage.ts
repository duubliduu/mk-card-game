import { CardType, Pressure, Reach, Stance, Weight } from "../types";

const damageReachMap = {
  [Reach.Grapple]: 15,
  [Reach.Punch]: 5,
  [Reach.Kick]: 10,
  [Reach.FireBall]: 5,
};

const calculateDamage = (attacker: CardType) => {
  return damageReachMap[attacker.reach] * attacker.weight;
};

const isDefending = (card: CardType) => {
  return card.pressure === Pressure.Defensive;
};

const isAttacking = (card: CardType) => {
  return card.pressure === Pressure.Aggressive;
};

const isParry = (leftCArd: CardType, rightCard: CardType) => {
  return (
    leftCArd.reach === rightCard.reach && leftCArd.stance === rightCard.stance
  );
};

const isJumping = (card: CardType) => {
  return card.stance === Stance.Air;
};

const isCrouching = (card: CardType) => {
  return card.stance === Stance.Low;
};

const isHigh = (card: CardType) => {
  return card.stance === Stance.High;
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
  return card.stance === Stance.Mid || card.stance === Stance.High;
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
): [number, boolean, string?] => {
  // If there's no defending card
  if (!defendingCard) {
    return [0, true, "Starter Card"];
  }

  // Setup trap card
  if (isDefending(attackingCard)) {
    return [0, true, "Defending"];
  }

  // Both Defending
  if (isDefending(attackingCard) && isDefending(defendingCard)) {
    return [0, true, "Impasse"];
  }

  // Trigger trap card
  if (isAttacking(attackingCard) && isDefending(defendingCard)) {
    if (isParry(attackingCard, defendingCard)) {
      return [-calculateDamage(defendingCard), true, "Parry!"];
    }

    if (doesWhiff(attackingCard, defendingCard)) {
      return [0, false, "Block!"];
    }

    return [-calculateDamage(defendingCard), true, "Counter!"];
  }

  if (doesWhiff(attackingCard, defendingCard)) {
    return [0, true, "Whiff!"];
  }

  if (!inReach(attackingCard, defendingCard)) {
    return [0, true, "Short!"];
  }

  // It's a hit
  // damage is depending on the weight
  // defines the start and recovery
  return [
    calculateDamage(attackingCard),
    // Heavy attack stops the turn
    isHeavy(attackingCard),
  ];
};
