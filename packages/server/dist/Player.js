"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
var generateDeck_1 = __importDefault(require("./utils/generateDeck"));
var Status;
(function (Status) {
    Status[Status["inQueue"] = 0] = "inQueue";
    Status[Status["inMatch"] = 1] = "inMatch";
})(Status = exports.Status || (exports.Status = {}));
var Player = /** @class */ (function () {
    function Player(socket) {
        var _this = this;
        this.deck = [];
        this.hand = [
            null,
            null,
            null,
        ];
        this.socket = socket;
        this.deck = (0, generateDeck_1.default)();
        this.draw(0, 1, 2);
        socket.emit("hand", this.hand);
        socket.emit("identify", socket.id);
        socket.on("play", function (index) {
            if (!_this.match) {
                socket.emit("message", "Cannot play a card, because you're not in a match");
                return;
            }
            if (!_this.inTurn) {
                socket.emit("message", "Wait for your turn!");
                return;
            }
            var cardToPlay = _this.hand[index];
            delete _this.hand[index];
            _this.draw(index);
            if (cardToPlay === null) {
                socket.emit("message", "You don't have card at that index");
                return;
            }
            // Play the card
            _this.match.play(cardToPlay);
            // the played card goes to everybody
            socket.nsp.to(_this.match.id).emit("play", cardToPlay);
            // hand goes just to you
            socket.emit("hand", _this.hand);
            // send side to everyone
            socket.emit("side", _this.side);
        });
    }
    Player.prototype.draw = function () {
        var _this = this;
        var indexes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            indexes[_i] = arguments[_i];
        }
        indexes.forEach(function (index) {
            var card = _this.deck.splice(0, 1)[0];
            _this.hand[index] = card;
        });
    };
    Object.defineProperty(Player.prototype, "status", {
        get: function () {
            if (this.match) {
                return Status.inMatch;
            }
            return Status.inQueue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "inTurn", {
        get: function () {
            return this.match && this.side === this.match.side;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "hitPoints", {
        get: function () {
            if (!this.match || this.side === undefined) {
                return undefined;
            }
            return this.match.hitPoints[this.side];
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.joinMatch = function (match, side) {
        var _this = this;
        this.socket.join(match.id);
        this.match = match;
        this.side = side;
        this.match.on("afterPlay", function () {
            var _a;
            _this.socket.emit("hitPoints", (_a = _this.match) === null || _a === void 0 ? void 0 : _a.hitPoints);
            _this.socket.emit("inTurn", _this.inTurn);
        });
        this.socket.emit("inTurn", this.inTurn);
    };
    return Player;
}());
exports.default = Player;
