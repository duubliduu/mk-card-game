import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "./types/card";
import { resolveDamage } from "./utils/resolveDamage";

type HitPoints = { [side in Side]: number };

class Match {
  id: string = uuidv4();
  side: Side = Side.Left;
  stack: CardType[] = [];
  hitPoints: HitPoints = {
    [Side.Left]: 100,
    [Side.Right]: 100,
  };
  events: { [key: string]: Function[] } = {};

  get opposingSide(): Side {
    return Number(!this.side);
  }

  dealDamage(damage: number) {
    this.hitPoints[this.opposingSide] -= damage;
  }

  endTurn() {
    this.side = Number(!this.side);
  }

  play(card: CardType) {
    const [damage, endTurn] = resolveDamage(card, this.stack[0]);
    // replace the top card
    this.stack = [card, ...this.stack];

    console.log(damage, endTurn);

    this.dealDamage(damage);

    if (endTurn) {
      this.endTurn();
    }

    this.trigger("afterPlay");
  }

  trigger(event: string) {
    this.events[event].forEach((callback) => {
      callback();
    });
  }

  on(event: string, callback: Function) {
    this.events[event] = [...(this.events[event] || []), callback];
  }
}

export default Match;
