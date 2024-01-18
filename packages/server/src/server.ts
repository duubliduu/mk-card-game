import { createServer } from "http";
import { Server } from "socket.io";
import logger from "./utils/logger";
import Connection from "./controllers/Game";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const connections = [];

io.on("connection", (socket) => {
  Connection.connect(socket);
});

io.listen(8080);

logger.info("Service available at 8080");
