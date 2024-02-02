import * as handlers from "../../src/handlers/playerHandlers";
import { mockGame, mockMatch, mockPlayer } from "../mocks/mockPlayer";
import { Side } from "../../src/types";

describe("PlayerHandlers", () => {
  describe("joinMatch", () => {
    beforeAll(() => {
      handlers.joinMatch(mockPlayer, "123");
    });
    it("should call findMatchById", () => {
      expect(mockGame.findMatchById).toHaveBeenCalledWith("123");
    });
    it("should find the match by id", () => {
      expect(mockMatch.join).toHaveBeenCalledWith(mockPlayer);
    });
  });

  describe("play", () => {
    beforeAll(() => {
      mockPlayer.match = mockMatch;
      mockPlayer.side = Side.Left;
      handlers.play(mockPlayer, [1, 2, 3]);
    });

    it("should not emit exit", () => {
      expect(mockPlayer.emit).not.toHaveBeenCalledWith("exit");
    });

    it("should call match play", () => {
      expect(mockPlayer.match?.play).toHaveBeenCalledWith(Side.Left, [1, 2, 3]);
    });
  });
});
