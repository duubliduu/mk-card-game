import { CardType, Guard, Pressure, Stance } from "../types";

const calculateDamage = (attacker: CardType, defender: CardType) => {
  const baseDamage = attacker.weight * 5 + attacker.pressure * 5;

  if (defender.pressure === Pressure.Defensive) {
    return Math.ceil(baseDamage / 5);
  }

  return baseDamage;
};

// -1 they get the turn OR they get to go again
// 0 turn ends
// +1 you get the turn OR you get to go again
export const resolveDamage = (
  attacker: CardType,
  defender: CardType
): [number, boolean, string?] => {
  // Set trap
  if (attacker.pressure === Pressure.Defensive) {
    return [0, true, "Defending"];
  }

  // If there's no defending card
  if (!defender) {
    return [0, true, "Starter Card"];
  }

  // Trap card triggered
  if (
    attacker.pressure === Pressure.Aggressive &&
    defender.pressure === Pressure.Defensive
  ) {
    if (defender.reach < attacker.reach) {
      return [0, true, "Short Counter"];
    }

    if (
      (attacker.guard === Guard.Air && defender.stance < Stance.Mid) ||
      (attacker.guard === Guard.Crouch && attacker.stance > Stance.Mid)
    ) {
      // you whiff again
      return [0, true, "Counter Whiffs"];
    }

    if (defender.weight > attacker.weight) {
      return [0, true, "Slow Counter"];
    }

    return [-calculateDamage(defender, attacker), true, "Counter!"];
  }

  // you don't reach
  if (attacker.reach < defender.reach) {
    // return recovery time based on
    // negative damage means whiff
    return [0, true, "Short!"];
  }

  // Mid hit every one
  // hi doesn't hit crouch
  // low doesn't hit air
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

  if (attacker.weight > defender.weight) {
    return [0, true, "Slow!"];
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
