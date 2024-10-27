import Match from "../../src/controllers/Match";
import { Game } from "../../src/controllers/Game";
import { Card, Guard, Reach, Side, Weight } from "../../src/types";
import Player from "../../src/controllers/Player";
import { Socket } from "socket.io";
import * as handlers from "../../src/handlers/playerHandlers";
import { resolveAttack, calculateDamage } from "../../src/utils/resolveAttack";

jest.mock("../../src/controllers/Game");
jest.mock("../../src/controllers/Player");
jest.mock("../../src/handlers/playerHandlers");
jest.mock("../../src/utils/resolveAttack");
jest.mock("socket.io");

const mockedResolveAttack = resolveAttack as jest.MockedFunction<
  typeof resolveAttack
>;
const mockedCalculateDamage = calculateDamage as jest.MockedFunction<
  typeof calculateDamage
>;

const MockSocket = Socket as jest.MockedClass<typeof Socket>;
// @ts-ignore
const mockedSocket = new MockSocket(1, 2, 3);

const game = new Game();
const playerLeft = new Player(mockedSocket, game);
const playerRight = new Player(mockedSocket, game);
const match = new Match(game);

const mockFindCardByIndex = jest
  .fn()
  .mockImplementation(() => [card, card, card]);

playerLeft.findCardByIndex = mockFindCardByIndex;
playerRight.findCardByIndex = mockFindCardByIndex;

playerLeft.side = Side.Left;
match.players[Side.Left] = playerLeft;

playerRight.side = Side.Right;
match.players[Side.Right] = playerRight;

const mockCard: Card = {
  guard: Guard.High,
  image: "PunchHighMedium.png",
  reach: Reach.Punch,
  weight: Weight.Medium,
};
mockedResolveAttack.mockImplementation(() => [Side.Left, mockCard]);

const card: jest.MockedObject<Card> = {
  guard: Guard.High,
  image: "KickHighMedium.png",
  reach: Reach.Kick,
  weight: Weight.Medium,
};

match.table[Side.Right] = {
  indices: [1, 2, 3],
  cards: [card, card, card],
};

const mockSupplementHand = jest.fn().mockImplementation(() => card);

playerLeft.supplementHand = mockSupplementHand;
playerRight.supplementHand = mockSupplementHand;

describe("Match", () => {
  describe("when cards are played", () => {
    beforeAll(() => {
      mockedCalculateDamage.mockReturnValue(30);
      match.play(Side.Left, [1, 2, 3]);
    });

    it("should resolve the attack", () => {
      expect(mockedResolveAttack).toHaveBeenCalledWith(card, card);
    });

    it("should deal damage", () => {
      // 3 x 10 = 30
      expect(match.hitPoints[Side.Left]).toBe(10);
    });

    it("should replace the plaed cards with new ones", () => {
      expect(playerLeft.supplementHand).toBeCalledWith(1);
    });

    it("should trigger afterPlay event", () => {
      expect(handlers.afterPlay).toHaveBeenCalledWith(playerLeft, match, [
        {
          gap: 0,
          message: "",
          "0": {
            damage: 30,
            guard: 2,
            image: "PunchHighMedium.png",
            reach: 3,
            weight: 2,
          },
          "1": {
            damage: 0,
            guard: 2,
            image: "KickHighMedium.png",
            reach: 5,
            weight: 2,
          },
        },
        {
          gap: 0,
          message: "",
          "0": {
            damage: 30,
            guard: 2,
            image: "PunchHighMedium.png",
            reach: 3,
            weight: 2,
          },
          "1": {
            damage: 0,
            guard: 2,
            image: "KickHighMedium.png",
            reach: 5,
            weight: 2,
          },
        },
        {
          gap: 0,
          message: "",
          "0": {
            damage: 30,
            guard: 2,
            image: "PunchHighMedium.png",
            reach: 3,
            weight: 2,
          },
          "1": {
            damage: 0,
            guard: 2,
            image: "KickHighMedium.png",
            reach: 5,
            weight: 2,
          },
        },
      ]);
    });

    it("should empty table", () => {
      expect(match.table[Side.Left]).toEqual({
        cards: [],
        indices: [],
      });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });
});
