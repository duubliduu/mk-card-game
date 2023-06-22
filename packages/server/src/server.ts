import { createServer } from "http";
import { Server } from "socket.io";
import Match from "./Match";
import Player, { Status } from "./Player";
import { Side } from "./types";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const players: Player[] = [];

const getQueue = () => {
  return players.filter((player) => player.status === Status.inQueue);
};

io.on("connection", (socket) => {
  players.push(new Player(socket));

  socket.on("disconnect", () => {
    const index = players.findIndex((player) => player.socket.id === socket.id);
    players.splice(index, 1);
  });

  if (getQueue().length > 1) {
    const [left, right] = getQueue().slice(0, 2);

    const match = new Match();

    left.joinMatch(match, Side.Left);
    right.joinMatch(match, Side.Right);
  }
});

io.listen(8080);
