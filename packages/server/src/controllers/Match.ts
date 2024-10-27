import { v4 as uuidv4 } from "uuid";
import { Card, Side } from "../types";
import { calculateDamage, resolveAttack } from "../utils/resolveAttack";
import Player from "./Player";
import logger from "../utils/logger";
import * as playerHandlers from "../handlers/playerHandlers";
import { Game } from "./Game";
import { HitPoints } from "../types";
import { AttackResult } from "../types/match";
import { flipSide } from "../utils/general";

class Match {
  public id: string = uuidv4();
  public hitPoints: HitPoints = {
    [Side.Left]: 1000,
    [Side.Right]: 1000,
  };
  public players: { [key in Side]: Player | null } = {
    [Side.Left]: null,
    [Side.Right]: null,
  };
  // Cards on the table
  public table: { [side in Side]: { indices: number[]; cards: Card[] } } = {
    [Side.Left]: {
      indices: [],
      cards: [],
    },
    [Side.Right]: {
      indices: [],
      cards: [],
    },
  };

  game: Game;

  get hasPlayers(): boolean {
    return !!this.players[Side.Left] && !!this.players[Side.Right];
  }

  constructor(game: Game) {
    this.game = game;
  }

  dealDamage({ [Side.Left]: leftSide, [Side.Right]: rightSide }: AttackResult) {
    if (leftSide.damage > 0) {
      this.hitPoints[Side.Left] -= leftSide.damage;
    }
    if (rightSide.damage > 0) {
      this.hitPoints[Side.Right] -= rightSide.damage;
    }
  }

  clearTable() {
    this.table = {
      [Side.Left]: {
        indices: [],
        cards: [],
      },
      [Side.Right]: {
        indices: [],
        cards: [],
      },
    };
  }

  replacePlayedCards() {
    Object.values(this.players).forEach((player) => {
      if (player && player.side) {
        this.table[player.side].indices.forEach((index) => {
          player.supplementHand(index);
        });
      }
    });
  }

  resolveRound(): AttackResult[] {
    const { [Side.Left]: leftCard, [Side.Right]: rightCard } = this.table;

    const results: AttackResult[] = [];

    for (let i = 0; i < 3; i++) {
      const cardOrMessage = resolveAttack(
        leftCard.cards[i],
        rightCard.cards[i]
      );

      const actionResult = {
        gap: 0,
        message: "",
        [Side.Left]: {
          damage: 0,
          ...leftCard.cards[i],
        },
        [Side.Right]: {
          damage: 0,
          ...rightCard.cards[i],
        },
      };

      if (typeof cardOrMessage === "string") {
        actionResult.message = cardOrMessage;
      } else {
        const [side, card] = cardOrMessage;
        actionResult[side].damage = calculateDamage(card);
        actionResult[flipSide(side)].damage = 0;
      }
      results.push(actionResult);
    }

    return results;
  }

  get bothSidesReady() {
    return (
      this.table[Side.Left].indices.length > 0 &&
      this.table[Side.Right].indices.length > 0
    );
  }

  play(side: Side, indices: number[]) {
    const cards = this.players[side]!.findCardByIndex(indices);

    this.table[side] = { indices, cards };

    if (!this.bothSidesReady) {
      return;
    }

    const results = this.resolveRound();

    for (const result of results) {
      this.dealDamage(result);
    }

    this.replacePlayedCards();

    this.trigger("afterPlay", this, results);

    this.clearTable();

    if (this.isGameOver) {
      this.gameOver();
    }
  }

  get cardsOnTable() {
    return Object.entries(this.table).reduce((table, [side, tableItem]) => {
      return {
        ...table,
        [side]: tableItem.cards,
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
    if (this.players[Side.Left] === null) {
      this.players[Side.Left] = player;
      return Side.Left;
    }
    if (this.players[Side.Right] === null) {
      this.players[Side.Right] = player;
      return Side.Right;
    }
    return undefined;
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
