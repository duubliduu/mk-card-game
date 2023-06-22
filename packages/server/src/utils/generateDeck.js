"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generateDeck = function (quantity) {
    if (quantity === void 0) { quantity = 50; }
    return Array(quantity)
        .fill(null)
        .map(function () { return ({
        stance: Math.ceil(Math.random() * 3) - 1,
        reach: Math.ceil(Math.random() * 4) - 1,
        weight: Math.ceil(Math.random() * 3),
        pressure: Math.ceil(Math.random() * 3) - 2,
    }); });
};
exports.default = generateDeck;
