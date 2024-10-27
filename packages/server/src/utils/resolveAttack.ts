import { Card, Guard, Reach, Side, Weight } from "../types";

type DamageReachMap = {
  [key in Exclude<Reach, Reach.None | Reach.Guard | Reach.Grapple>]: number;
};

const damageReachMap: DamageReachMap = {
  [Reach.Punch]: 5,
  [Reach.Knee]: 10,
  [Reach.Kick]: 10,
  [Reach.FireBall]: 10,
};

export const calculateDamage = (attacker: Card): number => {
  if (attacker.reach in damageReachMap) {
    // @ts-ignore
    const baseDamage = damageReachMap[attacker.reach];
    return baseDamage + baseDamage * attacker.weight;
  }
  return 0;
};

const isDefending = (card: Card) => {
  return card.reach === Reach.Guard;
};

const isAttacking = (card: Card): boolean => {
  return card.reach > Reach.Guard;
};

const isParry = (leftCArd: Card, rightCard: Card) => {
  return (
    leftCArd.reach === rightCard.reach && leftCArd.guard === rightCard.guard
  );
};

const isJumping = (card: Card) => {
  return card.guard === Guard.Air;
};

const isCrouching = (card: Card) => {
  return card.guard === Guard.Low;
};

const isHigh = (card: Card) => {
  return card.guard === Guard.High;
};

const doesWhiff = (attackingCard: Card, defendingCard: Card): boolean => {
  return (
    (isJumping(attackingCard) && isCrouching(defendingCard)) ||
    (isHigh(attackingCard) && isCrouching(defendingCard)) ||
    (isCrouching(attackingCard) && isJumping(defendingCard))
  );
};

const isLight = (card: Card) => {
  return card.weight === Weight.Light;
};

const isHeavy = (card: Card) => {
  return card.weight === Weight.Heavy;
};

const isStanding = (card: Card) => {
  return card.guard === Guard.Mid || card.guard === Guard.High;
};

const isOneMid = (leftCard: Card, rightCard: Card): [Side, Card] | null => {
  if (leftCard.guard === Guard.Mid && rightCard.guard !== Guard.Mid) {
    return [Side.Right, leftCard];
  }
  if (rightCard.guard === Guard.Mid && leftCard.guard !== Guard.Mid) {
    return [Side.Left, rightCard];
  }

  return null;
};

const inReach = (attackingCard: Card, defendingCard: Card) => {
  return attackingCard.reach >= defendingCard.reach;
};

// -1 they get the turn OR they get to go again
// 0 turn ends
function isBlocked(leftCard: Card, rightCard: Card) {
  return leftCard.guard === rightCard.guard;
}

const whichHasLongerReach = (
  leftCard: Card,
  rightCard: Card
): [Side, Card] | null => {
  if (leftCard.reach > rightCard.reach) {
    return [Side.Right, leftCard];
  } else if (rightCard.reach > leftCard.reach) {
    return [Side.Left, rightCard];
  }

  return null;
};

const whichIsFaster = (
  leftCard: Card,
  rightCard: Card
): [Side, Card] | null => {
  if (leftCard.weight > rightCard.weight) {
    return [Side.Right, leftCard];
  } else if (rightCard.weight > leftCard.weight) {
    return [Side.Left, rightCard];
  }
  return null;
};

const isAirAttack = (leftCard: Card, rightCard: Card): [Side, Card] | null => {
  if (
    [leftCard.guard, rightCard.guard].includes(Guard.Air) &&
    [leftCard.guard, rightCard.guard].includes(Guard.Mid)
  ) {
    return leftCard.guard === Guard.Air
      ? [Side.Left, leftCard]
      : [Side.Right, rightCard];
  }

  return null;
};

const isAntiAir = (leftCard: Card, rightCard: Card): [Side, Card] | false => {
  if (
    [leftCard.guard, rightCard.guard].includes(Guard.Air) &&
    [leftCard.guard, rightCard.guard].includes(Guard.High)
  ) {
    return leftCard.guard === Guard.High
      ? [Side.Left, leftCard]
      : [Side.Right, rightCard];
  }

  return false;
};

const whichOneWhiffs = (
  leftCard: Card,
  rightCard: Card
): [Side, Card] | null => {
  if (doesWhiff(leftCard, rightCard)) {
    return [Side.Right, leftCard];
  }
  if (doesWhiff(rightCard, leftCard)) {
    return [Side.Right, leftCard];
  }

  return null;
};

// +1 you get the turn OR you get to go again
/**
 * returns [damage, endTurn, message]
 */
export const resolveAttack = (
  leftCard: Card,
  rightCard: Card
): [Side, Card] | string => {
  // Both attacking
  if (isAttacking(leftCard) && isAttacking(rightCard)) {
    const longerReachResult = whichHasLongerReach(leftCard, rightCard);

    if (longerReachResult) {
      return longerReachResult;
    }

    const oneWhiffs = whichOneWhiffs(leftCard, rightCard);

    if (oneWhiffs) {
      return oneWhiffs;
    }

    const fasterOne = whichIsFaster(leftCard, rightCard);

    if (fasterOne) {
      return fasterOne;
    }

    const oneIsAirAttack = isAirAttack(leftCard, rightCard);

    // Is overhead
    if (oneIsAirAttack) {
      return oneIsAirAttack;
    }

    const oneIsAntiAir = isAntiAir(leftCard, rightCard);

    if (oneIsAntiAir) {
      return oneIsAntiAir;
    }

    const oneIsMid = isOneMid(leftCard, rightCard);

    if (oneIsMid) {
      return oneIsMid;
    }

    return "Tie!";
  }

  // left is attacking, right is defending
  if (isAttacking(leftCard) && isDefending(rightCard)) {
    if (doesWhiff(leftCard, rightCard)) {
      return "Whiff!";
    }
    if (!inReach(leftCard, rightCard)) {
      return "Short!";
    }
    if (!isBlocked(leftCard, rightCard)) {
      return "Blocked!";
    }
    return [Side.Left, leftCard];
  }

  // left is defending, right is attacking
  if (isDefending(leftCard) && isAttacking(rightCard)) {
    if (doesWhiff(rightCard, leftCard)) {
      return "Whiff!";
    }
    if (!inReach(rightCard, leftCard)) {
      return "Short!";
    }
    if (!isBlocked(rightCard, leftCard)) {
      return "Blocked!";
    }
    return [Side.Right, rightCard];
  }

  // Both defending
  return "Impass!";
};
