import { createServer } from "http";
import { Server } from "socket.io";
import Match from "./Match";
import Player from "./Player";

const httpServer = createServer();

const io = new Server(httpServer, {
  cookie: true,
  cors: {
    origin: "*",
  },
});

const players: Record<string, Player> = {};
const matches: Record<string, Match> = {};

io.on("connection", (socket) => {
  players[socket.id] = new Player(socket);

  // Everyone goes to the queue by default
  socket.join("queue");

  socket.emit("id", socket.id);

  // Challenge other player
  socket.on("challenge", (opponentId) => {
    // Create a match
    const match = new Match();
    // save the match
    matches[match.id] = match;
    // send the match to opponent
    socket.to(opponentId).emit("challenge", match.id);
    // send the match to self
    socket.emit("startMatch", match.id);
  });

  // Accept the challenge
  socket.on("match", (matchId: string) => {
    const match = matches[matchId];

    if (!match) {
      socket.emit("gameOver");
      return;
    }

    players[socket.id].joinMatch(match, () => {
      delete matches[matchId];
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });

  socket.nsp.to("queue").emit("queue", Object.keys(players));
});

console.log("Listening port 8080");

io.listen(8080);
