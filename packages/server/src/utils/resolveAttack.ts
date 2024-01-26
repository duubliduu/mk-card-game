import { CardType, Guard, Reach, Side, Weight } from "../types";

type DamageReachMap = {
  [key in Exclude<Reach, Reach.None | Reach.Guard | Reach.Grapple>]: number;
};

const damageReachMap: DamageReachMap = {
  [Reach.Punch]: 5,
  [Reach.Knee]: 10,
  [Reach.Kick]: 10,
  [Reach.FireBall]: 10,
};

export const calculateDamage = (attacker: CardType): number => {
  if (attacker.reach in damageReachMap) {
    // @ts-ignore
    const baseDamage = damageReachMap[attacker.reach];
    return baseDamage + baseDamage * attacker.weight;
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

type Result = { damage: { [key in Side]: number }; message: string };
const defaults: Result = {
  damage: {
    [Side.Left]: 0,
    [Side.Right]: 0,
  },
  message: "",
};

// -1 they get the turn OR they get to go again
// 0 turn ends
function isBlocked(leftCard: CardType, rightCard: CardType) {
  return leftCard.guard === rightCard.guard;
}

const whichHasAdvantage = (leftCard: CardType, rightCard: CardType) => {
  if (leftCard.reach > rightCard.reach) {
    return leftCard;
  } else if (rightCard.reach > leftCard.reach) {
    return rightCard;
  }
  return null;
};

const whichIsFaster = (leftCard: CardType, rightCard: CardType) => {
  if (leftCard.weight > rightCard.weight) {
    return leftCard;
  } else if (rightCard.weight > leftCard.weight) {
    return rightCard;
  }
  return null;
};

const isAirAttack = (
  leftCard: CardType,
  rightCard: CardType
): [Side, CardType] | false => {
  if (
    [leftCard.guard, rightCard.guard].includes(Guard.Air) &&
    [leftCard.guard, rightCard.guard].includes(Guard.Mid)
  ) {
    return leftCard.guard === Guard.Air
      ? [Side.Left, leftCard]
      : [Side.Right, rightCard];
  }

  return false;
};

const isAntiAir = (
  leftCard: CardType,
  rightCard: CardType
): [Side, CardType] | false => {
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

// +1 you get the turn OR you get to go again
/**
 * returns [damage, endTurn, message]
 */
export const resolveAttack = (
  leftCard: CardType,
  rightCard: CardType
): Result => {
  // Both attacking
  if (isAttacking(leftCard) && isAttacking(rightCard)) {
    const advantagedOne = whichHasAdvantage(leftCard, rightCard);

    if (advantagedOne) {
      return <Result>{
        damage: {
          [advantagedOne === leftCard ? Side.Right : Side.Left]:
            calculateDamage(advantagedOne),
          [advantagedOne !== rightCard ? Side.Left : Side.Right]: 0,
        },
        message: `${Reach[advantagedOne.reach]} has longer reach!`,
      };
    }

    const oneWhiffs =
      doesWhiff(leftCard, rightCard) || doesWhiff(rightCard, leftCard);

    if (oneWhiffs) {
      return <Result>{
        damage: {
          [Side.Left]: 0,
          [Side.Right]: 0,
        },
        message: "Whiff!",
      };
    }
    const fasterOne = whichIsFaster(leftCard, rightCard);

    if (fasterOne) {
      return <Result>{
        damage: {
          [fasterOne === leftCard ? Side.Right : Side.Left]:
            calculateDamage(fasterOne),
          [fasterOne !== rightCard ? Side.Left : Side.Right]: 0,
        },
        message: "",
      };
    }

    const oneIsAirAttack = isAirAttack(leftCard, rightCard);

    if (oneIsAirAttack) {
      return <Result>{
        damage: {
          [oneIsAirAttack[0]]: 0,
          [Number(!oneIsAirAttack[0]) as Side]: calculateDamage(
            oneIsAirAttack[1]
          ),
        },
        message: "Air attack!",
      };
    }

    const onIsAntiAir = isAntiAir(leftCard, rightCard);

    if (onIsAntiAir) {
      return <Result>{
        damage: {
          [onIsAntiAir[0]]: 0,
          [Number(!onIsAntiAir[0]) as Side]: calculateDamage(onIsAntiAir[1]),
        },
        message: "Antiair!",
      };
    }

    return <Result>{
      damage: {
        [Side.Left]: calculateDamage(rightCard),
        [Side.Right]: calculateDamage(leftCard),
      },
      message: "Tie!",
    };
  }

  // left is attacking, right is defending
  if (isAttacking(leftCard) && isDefending(rightCard)) {
    if (doesWhiff(leftCard, rightCard)) {
      return { ...defaults, message: "Whiff!" };
    }
    if (!inReach(leftCard, rightCard)) {
      return { ...defaults, message: "Short!" };
    }
    if (!isBlocked(leftCard, rightCard)) {
      return { ...defaults, message: "Blocked!" };
    }
    return {
      damage: {
        [Side.Left]: 0,
        [Side.Right]: calculateDamage(leftCard),
      },
      message: "",
    };
  }

  // left is defending, right is attacking
  if (isDefending(leftCard) && isAttacking(rightCard)) {
    if (doesWhiff(rightCard, leftCard)) {
      return { ...defaults, message: "Whiff!" };
    }
    if (!inReach(rightCard, leftCard)) {
      return { ...defaults, message: "Short!" };
    }
    if (!isBlocked(rightCard, leftCard)) {
      return { ...defaults, message: "Blocked!" };
    }
    return {
      damage: {
        [Side.Left]: calculateDamage(rightCard),
        [Side.Right]: 0,
      },
      message: "",
    };
  }

  // Both defending
  // Recover stamina
  return {
    ...defaults,
    message: "Impass!",
  };
};
