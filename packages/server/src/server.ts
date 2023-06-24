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

const getOtherPlayers = (socketId: string) => {
  return Object.keys(players).filter((id) => id === socketId);
};

io.on("connection", (socket) => {
  // Everyone goes to the queue by default
  socket.join("queue");

  // Identify the user for them
  socket.emit("id", socket.id);

  // Send list of players to the connected user
  socket.emit("queue", Object.keys(players));

  // Add new user to list
  players[socket.id] = new Player(socket);

  // Everyone else gets the new list
  socket.broadcast.to("queue").emit("queue", getOtherPlayers(socket.id));

  // User challenges someone
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

  // Enter the match
  socket.on("match", (matchId: string) => {
    const match = matches[matchId];

    if (!match) {
      socket.emit("message", `Match with id ${matchId} doesn't exist`);
      socket.emit("gameOver");
      return;
    }

    players[socket.id].joinMatch(match, () => {
      delete matches[matchId];
      socket.emit("gameOver");
    });

    socket.nsp.to(matchId).emit("enter", match.isReady);
  });

  socket.on("disconnect", () => {
    const player = players[socket.id];

    if (player && player.match) {
      const matchId = player.match.id;

      socket.nsp.to(matchId).emit("leave");

      // Leave the match
      player.leaveMatch();

      // If the match still exists
      if (matches[matchId]) {
        const isMatchVacant = Object.values(matches[matchId].players).every(
          (x) => x === null
        );

        // If both players has left
        if (isMatchVacant) {
          // Remove match form memory
          delete matches[matchId];
        }
      }
    }

    // Remove player from memory
    delete players[socket.id];

    // You're out, everyone gets the update list
    socket.broadcast.to("queue").emit("queue", getOtherPlayers(socket.id));
  });
});

io.listen(8080);

console.log("Server started at 8080");
