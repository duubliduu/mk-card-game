import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "./types";
import { resolveDamage } from "./utils/resolveDamage";
import Player from "./Player";
import logger from "./utils/logger";

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
    if (this.hitPoints[this.opposingSide] < damage) {
      this.hitPoints[this.opposingSide] = 0;
    } else {
      this.hitPoints[this.opposingSide] -= damage;
    }

    this.players[this.opposingSide]?.hurt(damage, message);
  }

  endTurn() {
    this.side = this.opposingSide;
  }

  get topCard() {
    return this.stack[this.stack.length - 1];
  }

  play(card: CardType) {
    const [damage, endTurn, message] = resolveDamage(card, this.topCard);

    logger.info("Match:play", { damage, endTurn, message });

    // replace the top card
    this.stack = [...this.stack, card];

    logger.info("Match:play", { card });

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

  join(player: Player): Side | undefined {
    for (let side: Side = 0; side < 2; side++) {
      if (!this.players[side]) {
        this.players[side] = player;
        return side;
      }
    }
  }
  leave(socketId: string) {
    (Object.keys(this.players) as unknown as [Side]).forEach((side) => {
      const player = this.players[side as unknown as Side];
      if (player && player.socket.id == socketId) {
        // Remove the player from the game
        this.players[side] = null;
      }
    });
  }
}

export default Match;
