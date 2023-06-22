"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var types_1 = require("./types");
var resolveDamage_1 = require("./utils/resolveDamage");
var Match = /** @class */ (function () {
    function Match() {
        var _a;
        this.id = (0, uuid_1.v4)();
        this.side = types_1.Side.Left;
        this.stack = [];
        this.hitPoints = (_a = {},
            _a[types_1.Side.Left] = 100,
            _a[types_1.Side.Right] = 100,
            _a);
        this.events = {};
    }
    Object.defineProperty(Match.prototype, "opposingSide", {
        get: function () {
            return Number(!this.side);
        },
        enumerable: false,
        configurable: true
    });
    Match.prototype.dealDamage = function (damage) {
        this.hitPoints[this.opposingSide] -= damage;
    };
    Match.prototype.endTurn = function () {
        this.side = Number(!this.side);
    };
    Match.prototype.play = function (card) {
        var _a = (0, resolveDamage_1.resolveDamage)(card, this.stack[0]), damage = _a[0], endTurn = _a[1];
        // replace the top card
        this.stack = __spreadArray([card], this.stack, true);
        this.dealDamage(damage);
        if (endTurn) {
            this.endTurn();
        }
        this.trigger("afterPlay");
    };
    Match.prototype.trigger = function (event) {
        this.events[event].forEach(function (callback) {
            callback();
        });
    };
    Match.prototype.on = function (event, callback) {
        this.events[event] = __spreadArray(__spreadArray([], (this.events[event] || []), true), [callback], false);
    };
    return Match;
}());
exports.default = Match;
