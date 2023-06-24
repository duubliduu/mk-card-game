import { CardType, Guard, Stance } from "../types";

const calculateDamage = (attacker: CardType, defender: CardType) => {
  return (
    20 + attacker.weight * 5 + defender.pressure * 5 + attacker.pressure * 5
  );
};

// -1 they get the turn OR they get to go again
// 0 turn ends
// +1 you get the turn OR you get to go again
export const resolveDamage = (
  attacker: CardType,
  defender: CardType
): [number, boolean, string?] => {
  // If there's no defending card
  if (!defender) {
    return [0, true, "Starting Card"];
  }

  // you don't reach
  if (attacker.reach < defender.reach) {
    // return recovery time based on
    // negative damage means whiff
    return [0, true, "Out of reach!"];
  }

  // Mid hits every one
  // hi doesnt hit crouch
  // low doesnt hit air
  if (
    (defender.guard === Guard.Air && attacker.stance < Stance.Mid) ||
    (defender.guard === Guard.Crouch && attacker.stance > Stance.Mid)
  ) {
    // you whiff again
    return [0, true, "Whiff!"];
  }

  // If both are defensive no damage
  if (attacker.pressure + defender.pressure === -2) {
    return [0, true, "Both Defending!"];
  }

  // It's a hit
  // damage is depending on the weight
  // weight defines the start and recovery
  return [
    calculateDamage(attacker, defender),
    attacker.pressure + defender.pressure < 0 || // if either one is defending
      attacker.weight === 3, // Heavy attack ends the turn
  ];
};
