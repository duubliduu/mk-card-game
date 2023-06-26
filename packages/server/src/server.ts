import { createServer } from "http";
import { Server } from "socket.io";
import Match from "./Match";
import Player from "./Player";
import logger from "./utils/logger";
import AIClient from "./AIClient";

const httpServer = createServer();

const io = new Server(httpServer, {
  cookie: true,
  cors: {
    origin: "*",
  },
});

type Challenge = {
  by: string;
  matchId: string;
};

const players: Record<string, Player> = {};
const matches: Record<string, Match> = {};
const challenges: { [id: string]: Challenge } = {};

const clients: { [id: string]: AIClient } = {};

const getOtherPlayers = (socketId: string) => {
  return Object.entries(players)
    .map(([id, player]) => [id, player.name])
    .filter(([id]) => id === socketId);
};

const createPracticeMatch = () => {
  logger.info("User started match against the AI");

  // Create a match for this
  const match = new Match();

  const aiClient = new AIClient();

  clients[aiClient.id] = aiClient;

  matches[match.id] = match;

  aiClient.socket.emit("match", match.id);

  return match;
};

io.on("connection", (socket) => {
  logger.info("User connected", { user: socket.id });

  // Everyone goes to the queue by default
  socket.join("queue");

  // Identify the user for them
  socket.emit("id", socket.id);

  // Send list of players to the connected user
  socket.emit(
    "queue",
    Object.entries(players).map(([id, player]) => [id, player.name])
  );

  // Add new user to list
  players[socket.id] = new Player(socket);

  // Everyone else gets the new list
  socket.broadcast.to("queue").emit("queue", getOtherPlayers(socket.id));

  // User challenges someone
  socket.on("challenge", (opponentId) => {
    logger.info("Challenge event", { id: socket.id, opponentId });

    // Create a match
    const match = new Match();

    // save the match
    matches[match.id] = match;

    const challenge: Challenge = {
      by: players[socket.id].name || socket.id,
      matchId: match.id,
    };
    const challengeKey: string = `${opponentId}-${match.id}`;

    challenges[challengeKey] = challenge;

    // send the match to opponent
    socket.to(opponentId).emit("challenges", { [challengeKey]: challenge });

    // send the match to self
    socket.emit("startMatch", match.id);
  });

  // Enter the match
  socket.on("match", (matchId: string) => {
    const match = matchId === "AI" ? createPracticeMatch() : matches[matchId];

    // Delete the challenge
    const challengeKey = `${socket.id}-${matchId}`;
    delete challenges[challengeKey];

    socket.emit("challenges", {});

    logger.info("User entered a match", {
      user: socket.id,
      matchId: match.id,
      challengeKey,
    });

    if (!match) {
      logger.info("User tried to join a match no longer available", {
        matchId,
        user: socket.id,
      });
      socket.emit("message", `Match with id ${matchId} doesn't exist`);
      socket.emit("gameOver");
      return;
    }

    players[socket.id].joinMatch(match);

    if (!!players[socket.id].opponent) {
      // Notify one entering a match in progress
      socket.emit("enter", match.isReady);
    }
    // Notify the challenger that you have joined
    socket.broadcast.to(matchId).emit("enter", match.isReady);
  });

  socket.on("name", (name: string) => {
    logger.info("User changed name", { name, user: socket.id });
    players[socket.id].name = name;
    socket.broadcast.to("queue").emit("queue", getOtherPlayers(socket.id));
  });

  // Leaving match will be seen as a forfeit
  // Leaving a match will delete it
  socket.on("leave", () => {
    const opponentId = players[socket.id].opponent?.id;
    const matchId = players[socket.id].leaveMatch();

    logger.info("User left the match", { id: socket.id, matchId });

    if (opponentId) {
      // Notify the opponent of my leaving
      socket.to(opponentId).emit("leave");
      logger.info("Say bye bye!", { opponentId, matchId });
    }

    if (matchId) {
      delete matches[matchId];
    }

    logger.info("Match was deleted!", {
      matchId,
    });
  });

  socket.on("disconnect", () => {
    const player = players[socket.id];

    if (player && player.match) {
      const matchId = player.match.id;

      socket.nsp.to(matchId).emit("leave");

      // Leave the match if any
      player.leaveMatch();

      // If the match still exists
      if (matches[matchId]) {
        const isMatchVacant = Object.values(matches[matchId].players).every(
          (x) => x === null
        );

        // If both players left
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

logger.info("Service available at 8080");
