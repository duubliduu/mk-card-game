import { Game } from "../../src/controllers/Game";
import Player from "../../src/controllers/Player";
import Match from "../../src/controllers/Match";

const mockedSocket = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  removeAllListeners: jest.fn().mockReturnThis(),
  disconnect: jest.fn().mockReturnThis(),
  join: jest.fn().mockReturnThis(),
  leave: jest.fn().mockReturnThis(),
  rooms: new Set(),
  data: {},
  broadcast: {},
  nsp: {},
};

mockedSocket.broadcast = mockedSocket;
mockedSocket.nsp = mockedSocket;

export const mockGame = new Game();
// @ts-ignore
export const mockPlayer = new Player(mockedSocket, mockGame);
mockPlayer.emit = jest.fn();

export const mockMatch = new Match(mockGame);
mockMatch.play = jest.fn();

mockMatch.join = jest.fn();
mockGame.findMatchById = jest.fn().mockReturnValue(mockMatch);
