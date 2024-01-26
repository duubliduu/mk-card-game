import { createServer } from "http";
import { Server } from "socket.io";
import logger from "./utils/logger";
import Game from "./controllers/Game";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  Game.connectPlayer(socket);
});

io.listen(8080);

logger.info("Service available at 8080");
