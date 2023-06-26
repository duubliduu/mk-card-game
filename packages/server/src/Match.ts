import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "./types";
import { resolveDamage } from "./utils/resolveDamage";
import Player from "./Player";
import logger from "./utils/logger";

type HitPoints = { [side in Side]: number };

class Match {
  private events: { [key: string]: Function[] } = {};
  private timer?: NodeJS.Timeout;

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

    // Add new timer
    this.timer = setTimeout(() => {
      logger.info("TIMER RAN OUT", { timer: this.timer });
      this.pass();
    }, 5000);
  }

  get topCard() {
    return this.stack[this.stack.length - 1];
  }

  pass() {
    logger.info("Cleared timeout", { timer: this.timer });

    this.dealDamage(0, "Timeout!");

    this.endTurn();

    this.trigger("afterPlay", this.isGameOver);
  }

  play(card: CardType) {
    clearTimeout(this.timer);

    const [damage, endTurn, message] = resolveDamage(card, this.topCard);

    logger.info("Match:play", { damage, endTurn, message });

    // replace the top card
    this.stack = [...this.stack, card];

    logger.info("Match:play", { card });

    this.dealDamage(damage, message);

    if (endTurn) {
      this.endTurn();
    }

    this.trigger("afterPlay", this.isGameOver);

    if (this.isGameOver) {
      this.gameOver();
    }
  }

  get isGameOver() {
    return this.hitPoints[Side.Left] <= 0 || this.hitPoints[Side.Right] <= 0;
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
    // Clear the timer if the player leaves
    clearTimeout(this.timer);

    (Object.keys(this.players) as unknown as [Side]).forEach((side) => {
      const player = this.players[side as unknown as Side];
      if (player && player.socket.id == socketId) {
        // Remove the player from the game
        this.players[side] = null;
      }
    });
  }

  get winner(): Side {
    if (this.hitPoints[Side.Left] > this.hitPoints[Side.Right]) {
      return Side.Left;
    }
    return Side.Right;
  }

  get loser(): Side {
    return Number(!this.winner);
  }

  gameOver() {
    clearTimeout(this.timer);

    this.players[this.winner]?.win();
    this.players[this.loser]?.lose();
  }
}

export default Match;
