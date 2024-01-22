import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "../types";
import { resolveDamage } from "../utils/resolveDamage";
import Player from "./Player";
import logger from "../utils/logger";
import * as playerHandlers from "../handlers/playerHandlers";
import { Game } from "./Game";

type HitPoints = { [side in Side]: number };

class Match {
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
  public stack: { [side in Side]: CardType[] } = {
    [Side.Left]: [],
    [Side.Right]: [],
  };

  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  get isReady(): boolean {
    return !!this.players[Side.Left] && !!this.players[Side.Right];
  }

  get opposingSide(): Side {
    return Number(!this.side);
  }

  get hasPlayers(): boolean {
    return (
      this.players[Side.Left] !== null && this.players[Side.Right] !== null
    );
  }

  dealDamage(damage: number, message?: string) {
    // Negative damage hurts you
    if (damage < 0) {
      if (this.hitPoints[this.side] < damage) {
        this.hitPoints[this.side] = 0;
      } else {
        this.hitPoints[this.side] += damage;
      }
    } else {
      if (this.hitPoints[this.opposingSide] < damage) {
        this.hitPoints[this.opposingSide] = 0;
      } else {
        this.hitPoints[this.opposingSide] -= damage;
      }
    }

    this.players[this.opposingSide]?.hurt(damage, message);
  }

  endTurn() {
    this.side = this.opposingSide;
  }

  get topCard() {
    const stack = this.stack[this.opposingSide];
    const lastIndex = stack.length - 1;
    return stack[lastIndex];
  }

  pass() {
    logger.info("Cleared timeout", { timer: this.timer });

    this.dealDamage(0, "Timeout!");

    this.endTurn();

    this.trigger("afterPlay", this.isGameOver, this);
  }

  play(card: CardType) {
    const { damage, endTurn, message } = resolveDamage(card, this.topCard);

    // replace the top card
    this.stack[this.side].push(card);

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

  private trigger(event: keyof typeof playerHandlers, ...args: any[]) {
    const player = this.players[this.side];
    // @ts-ignore
    playerHandlers[event](player, ...args);
  }

  join(player: Player): Side | undefined {
    for (let side: Side = 0; side < 2; side++) {
      if (!this.players[side]) {
        this.players[side] = player;
        logger.info("Player joined the match", { side, match: this.id });
        return side;
      }
    }
  }

  leave(side: Side) {
    this.players[side] = null;

    if (!this.hasPlayers) {
      this.game.removeMatch(this.id);
      logger.info("Match removed", { matchId: this.id });
    }
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
    this.players[this.winner]?.win();
    this.players[this.loser]?.lose();

    this.resetPlayers();
  }

  resetPlayers() {
    this.players = {
      [Side.Left]: null,
      [Side.Right]: null,
    };
  }
}

export default Match;
