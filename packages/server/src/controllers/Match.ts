import { v4 as uuidv4 } from "uuid";
import { CardType, Side } from "../types";
import { resolveAttack } from "../utils/resolveAttack";
import Player from "./Player";
import logger from "../utils/logger";
import * as playerHandlers from "../handlers/playerHandlers";
import { Game } from "./Game";
import { flipSide } from "../utils/general";
import { HitPoints } from "../types/player";

class Match {
  public id: string = uuidv4();
  public hitPoints: HitPoints = {
    [Side.Left]: 100,
    [Side.Right]: 100,
  };
  public players: { [key in Side]: Player | null } = {
    [Side.Left]: null,
    [Side.Right]: null,
  };
  // Cards on the table
  public table: { [side in Side]: { index: number; card: CardType | null } } = {
    [Side.Left]: {
      index: -1,
      card: null,
    },
    [Side.Right]: {
      index: -1,
      card: null,
    },
  };

  game: Game;

  get hasPlayers(): boolean {
    return !!this.players[Side.Left] && !!this.players[Side.Right];
  }

  constructor(game: Game) {
    this.game = game;
  }

  dealDamage(damage: { [Side.Left]: number; [Side.Right]: number }) {
    if (damage[Side.Left] > 0) {
      this.hitPoints[Side.Left] -= damage[Side.Left];
    }
    if (damage[Side.Right] > 0) {
      this.hitPoints[Side.Right] -= damage[Side.Right];
    }
  }

  clearTable() {
    this.table = {
      [Side.Left]: {
        index: -1,
        card: null,
      },
      [Side.Right]: {
        index: -1,
        card: null,
      },
    };
  }

  dealCards() {
    Object.values(this.players).forEach((player) => {
      if (player) {
        player.supplementHand(this.table[player.side!].index);
      }
    });
  }

  play(side: Side, card: { index: number; card: CardType }) {
    // Set card on the table, your side, face down
    this.table[side] = card;

    if (this.table[flipSide(side)].index === -1) {
      return;
    }

    const { [Side.Left]: leftCard, [Side.Right]: rightCard } = this.table;

    const { damage, message } = resolveAttack(
      leftCard!.card!,
      rightCard!.card!
    );

    this.dealDamage(damage);

    this.dealCards();

    this.trigger("afterPlay", this, damage, message);

    if (this.isGameOver) {
      this.gameOver();
    }

    this.clearTable();
  }

  get cardsOnTable() {
    return Object.entries(this.table).reduce((table, [side, tableItem]) => {
      return {
        ...table,
        [side]: tableItem.card,
      };
    }, {});
  }

  get isGameOver() {
    return this.hitPoints[Side.Left] <= 0 || this.hitPoints[Side.Right] <= 0;
  }

  private trigger(event: keyof typeof playerHandlers, ...args: any[]) {
    for (let side in this.players) {
      const player = this.players[side as unknown as Side];
      if (player) {
        // @ts-ignore
        playerHandlers[event](player, ...args);
      }
    }
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
