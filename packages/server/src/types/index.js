"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Side = exports.Pressure = exports.Weight = exports.Reach = exports.Stance = void 0;
var Stance;
(function (Stance) {
    Stance[Stance["Low"] = 0] = "Low";
    Stance[Stance["Mid"] = 1] = "Mid";
    Stance[Stance["High"] = 2] = "High";
})(Stance = exports.Stance || (exports.Stance = {}));
var Reach;
(function (Reach) {
    Reach[Reach["Grapple"] = 0] = "Grapple";
    Reach[Reach["Punch"] = 1] = "Punch";
    Reach[Reach["Kick"] = 2] = "Kick";
    Reach[Reach["FireBall"] = 3] = "FireBall";
})(Reach = exports.Reach || (exports.Reach = {}));
var Weight;
(function (Weight) {
    Weight[Weight["Light"] = 1] = "Light";
    Weight[Weight["Medium"] = 2] = "Medium";
    Weight[Weight["Heavy"] = 3] = "Heavy";
})(Weight = exports.Weight || (exports.Weight = {}));
var Pressure;
(function (Pressure) {
    Pressure[Pressure["Defensive"] = -1] = "Defensive";
    Pressure[Pressure["Controlled"] = 0] = "Controlled";
    Pressure[Pressure["Aggressive"] = 1] = "Aggressive";
})(Pressure = exports.Pressure || (exports.Pressure = {}));
var Side;
(function (Side) {
    Side[Side["Left"] = 0] = "Left";
    Side[Side["Right"] = 1] = "Right";
})(Side = exports.Side || (exports.Side = {}));
