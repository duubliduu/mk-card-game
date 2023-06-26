import { v4 as uuidv4 } from "uuid";
import logger from "./utils/logger";
import AIClient from "./AIClient";
import { Socket } from "socket.io";

class AISocket {
  public id: string = uuidv4();
  private events: { [key: string]: (...args: any[]) => void } = {};
  private client: AIClient;
  private socket: Socket;
  private channel: "nsp" | "broadcast" | "" = "";
  private room: string = "";

  constructor(socket: Socket) {
    this.socket = socket;
    this.client = new AIClient(this);
  }

  public join(id: string) {
    logger.info("AI join was called", { room: id });
  }

  public leave(id: string) {
    logger.info("AI leave was called");
  }

  emitOut(event: keyof AIClient, payload?: any) {
    logger.info("emit out", {
      event,
      payload,
      channel: this.channel,
      room: this.room,
    });

    this.socket.emit(event, payload);

    // Reset channel
    this.channel = "";
  }

  // Emit to client
  public emit(event: keyof AIClient, payload?: any) {
    logger.info("AI emit was called", { event, payload });

    if (this.room === this.id) {
      logger.info("THIS EMIT TARGET MYSELF");
    }
    // If the target is someone else than myself
    if (
      this.room && // Someone else is targeted
      this.channel // or Some channel is targeted
    ) {
      this.emitOut(event, payload);
      return;
    }

    // Hijack request to AI
    if (event === "inTurn") {
      this.client.inTurn(payload);
    } else if (event === "play") {
      this.client.play(payload);
    } else {
      // @ts-ignore
      this.client[event](payload);
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    logger.info("AI registered event", { event, callback });
    this.events[event] = callback;
  }

  // Trigger called by client
  public trigger(event: string, payload?: any) {
    logger.info("AI trigger was called", { event, payload });
    if (typeof this.events[event] === "function") {
      this.events[event](payload);
    } else {
      logger.warn("AI triggered unregistered function", { event, payload });
    }
  }

  public to(id: string) {
    logger.info("AI to was called", { user: id });
    this.room = id;
    return this;
  }

  get broadcast() {
    this.channel = "broadcast";
    logger.info("AI broadcast was called");
    return this;
  }

  get nsp() {
    logger.info("AI nsp was called");
    this.channel = "nsp";
    return this;
  }
}

export default AISocket;
