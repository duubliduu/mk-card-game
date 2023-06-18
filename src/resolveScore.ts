import { CardType } from "./Card";

// -1 they get the turn OR they get to go again
// 0 turn ends
// +1 you get the turn OR you get to go again
export const resolveScore = (
  attacker: CardType,
  defender: CardType
): number => {
  // you don't reach
  if (attacker.reach < defender.reach) {
    // but you move in
    if (attacker.balance > defender.balance) {
      return defender.weight;
    }
  }

  if (attacker.balance - defender.balance === -1) {
    // you defend, end turn
    return 0;
  }
  if (attacker.balance - defender.balance === 1) {
    // you get hit
    return -defender.weight;
  }

  // the one in defending role gets hit
  if (attacker.balance - defender.balance === 0) {
    return -defender.weight;
  }

  if (attacker.balance - defender.balance === -2) {
    // you step back blocking as they rush in, you get the turn
    // you get to punish
    return defender.weight;
  }

  if (attacker.balance - defender.balance === 2) {
    // you rush them, but they defend making you whiff
    // you get punished!
    // weight tells you hard you whiff
    return -attacker.weight;
  }

  return attacker.weight;
};
