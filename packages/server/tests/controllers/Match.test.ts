import Match from "../../src/controllers/Match";
import { Game } from "../../src/controllers/Game";
import { CardType, Guard, Reach, Side, Weight } from "../../src/types";
import Player from "../../src/controllers/Player";
import { Socket } from "socket.io";
import * as handlers from "../../src/handlers/playerHandlers";
import { resolveAttack } from "../../src/utils/resolveAttack";

jest.mock("../../src/controllers/Game");
jest.mock("../../src/controllers/Player");
jest.mock("../../src/handlers/playerHandlers");
jest.mock("../../src/utils/resolveAttack");
jest.mock("socket.io");

const mockedResolveAttack = resolveAttack as jest.MockedFunction<
  typeof resolveAttack
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

mockedResolveAttack.mockImplementation(() => ({
  damage: {
    [Side.Left]: 10,
    [Side.Right]: 0,
  },
  message: "Left card has longer reach!",
}));

const card: jest.MockedObject<CardType> = {
  guard: Guard.High,
  image: "",
  reach: Reach.Punch,
  weight: Weight.Medium,
  move: 1,
};

match.table[Side.Right] = {
  index: [1, 2, 3],
  card: [card, card, card],
};

const mockSupplementHand = jest.fn().mockImplementation(() => card);

playerLeft.supplementHand = mockSupplementHand
playerRight.supplementHand = mockSupplementHand

describe("Match", () => {
  describe("when cards are played", () => {
    beforeAll(() => {
      match.play(Side.Left, [1, 2, 3]);
    });

    it("should resolve the attack", () => {
      expect(mockedResolveAttack).toHaveBeenCalledWith(card, card);
    });

    it("should deal damage", () => {
      // 3 x 10 = 30
      expect(match.hitPoints[Side.Left]).toBe(70);
    });

    it("should replace the plaed cards with new ones", () => {
      expect(playerLeft.supplementHand).toBeCalledWith(1);
    });

    it("should trigger afterPlay event", () => {
      expect(handlers.afterPlay).toHaveBeenCalledWith(playerLeft, match, [
        { damage: { "0": 10, "1": 0 }, message: "Left card has longer reach!" },
        { damage: { "0": 10, "1": 0 }, message: "Left card has longer reach!" },
        { damage: { "0": 10, "1": 0 }, message: "Left card has longer reach!" },
      ]);
    });

    it("should empty table", () => {
      expect(match.table[Side.Left]).toEqual({ index: [], card: [] });
    });

    afterAll(() => {
      jest.clearAllMocks();
    });
  });
});
