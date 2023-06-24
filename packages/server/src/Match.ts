import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "./types";
import { resolveDamage } from "./utils/resolveDamage";
import Player from "./Player";

type HitPoints = { [side in Side]: number };

class Match {
  private events: { [key: string]: Function[] } = {};

  public id: string = uuidv4();
  public side: Side = Side.Left;
  public hitPoints: HitPoints = {
    [Side.Left]: 100,
    [Side.Right]: 100,
  };
  public players: { [key in Side]: Player | null } = {
    [Side.Left]: null,
    [Side.Right]: null,
  };
  public stack: CardType[] = [];

  get isReady(): boolean {
    return !!this.players[Side.Left] && !!this.players[Side.Right];
  }

  get opposingSide(): Side {
    return Number(!this.side);
  }

  dealDamage(damage: number, message?: string) {
    this.hitPoints[this.opposingSide] -= damage;
    this.players[this.opposingSide]?.hurt(damage, message);
  }

  endTurn() {
    this.side = Number(!this.side);
  }

  play(card: CardType) {
    const [damage, endTurn, message] = resolveDamage(card, this.stack[0]);
    // replace the top card
    this.stack = [...this.stack, card];

    this.dealDamage(damage, message);

    if (endTurn) {
      this.endTurn();
    }

    this.trigger("afterPlay");
  }

  private trigger(event: string, ...params: any[]) {
    this.events[event].forEach((callback) => {
      callback(...params);
    });
  }

  on(event: string, callback: Function) {
    this.events[event] = [...(this.events[event] || []), callback];
  }

  setSide(player: Player): Side | undefined {
    for (let side: Side = 0; side < 2; side++) {
      if (!this.players[side]) {
        this.players[side] = player;
        return side;
      }
    }
  }
}

export default Match;
