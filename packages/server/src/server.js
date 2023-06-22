"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var Match_1 = __importDefault(require("./Match"));
var Player_1 = __importStar(require("./Player"));
var types_1 = require("./types");
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
    },
});
var players = [];
var getQueue = function () {
    return players.filter(function (player) { return player.status === Player_1.Status.inQueue; });
};
io.on("connection", function (socket) {
    players.push(new Player_1.default(socket));
    socket.on("disconnect", function () {
        var index = players.findIndex(function (player) { return player.socket.id === socket.id; });
        players.splice(index, 1);
    });
    if (getQueue().length > 1) {
        var _a = getQueue().slice(0, 2), left = _a[0], right = _a[1];
        var match = new Match_1.default();
        left.joinMatch(match, types_1.Side.Left);
        right.joinMatch(match, types_1.Side.Right);
    }
});
io.listen(8080);
