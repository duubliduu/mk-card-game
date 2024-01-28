import { calculateDamage, resolveAttack } from "../../src/utils/resolveAttack";
import { CardType, Guard, Reach, Side, Weight } from "../../src/types";

const punchMidLight: CardType = {
  image: "",
  guard: Guard.Mid,
  reach: Reach.Punch,
  weight: Weight.Light,
};
const punchMidMedium: CardType = {
  ...punchMidLight,
  weight: Weight.Medium,
};
const punchMidHeavy: CardType = {
  ...punchMidLight,
  weight: Weight.Heavy,
};

const kneeMidLight: CardType = {
  image: "",
  guard: Guard.Mid,
  reach: Reach.Knee,
  weight: Weight.Light,
};

const kickMidLight: CardType = {
  image: "",
  guard: Guard.Mid,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickMidMedium: CardType = {
  ...kickMidLight,
  weight: Weight.Medium,
};
const kickMidHeavy: CardType = {
  ...kickMidLight,
  weight: Weight.Heavy,
};

const kickHighLight: CardType = {
  image: "",
  guard: Guard.High,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickLowLight: CardType = {
  image: "",
  guard: Guard.Low,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickAirLight: CardType = {
  image: "",
  guard: Guard.Air,
  reach: Reach.Kick,
  weight: Weight.Light,
};

describe("resolveDamage", () => {
  describe("when guard, reach and weight matches", () => {
    it("should tie", () => {
      expect(resolveAttack(punchMidLight, punchMidLight)).toEqual({
        damage: {
          [Side.Left]: 10,
          [Side.Right]: 10,
        },
        message: "Tie!",
      });
    });
  });

  describe("when longer reach", () => {
    it("should have advantage", () => {
      expect(resolveAttack(punchMidLight, kickMidLight)).toEqual({
        damage: {
          [Side.Left]: 20,
          [Side.Right]: 0,
        },
        message: "Kick has longer reach!",
      });
    });
  });

  describe("when weight is lighter", () => {
    it("should have advantage", () => {
      expect(resolveAttack(punchMidLight, punchMidMedium)).toEqual({
        damage: {
          [Side.Left]: 15,
          [Side.Right]: 0,
        },
        message: "",
      });
    });
  });

  describe("when crouching", () => {
    describe("against mid attack", () => {
      it("should have advantage", () => {
        expect(resolveAttack(kickAirLight, kickMidLight)).toEqual({
          damage: {
            [Side.Left]: 0,
            [Side.Right]: 20,
          },
          message: "Air attack!",
        });
      });
    });

    describe("against high attack", () => {
      it("should be antiaired", () => {
        expect(resolveAttack(kickAirLight, kickHighLight)).toEqual({
          damage: {
            [Side.Left]: 20,
            [Side.Right]: 0,
          },
          message: "Antiair!",
        });
      });
    });

    describe("against air attack", () => {
      it("should whiff", () => {
        expect(resolveAttack(kickAirLight, kickLowLight)).toEqual({
          damage: {
            [Side.Left]: 0,
            [Side.Right]: 0,
          },
          message: "Whiff!",
        });
      });
    });
  });

  describe("knee", () => {
    it("should be shorter than kick", () => {
      expect(resolveAttack(kickMidLight, kneeMidLight)).toEqual({
        damage: {
          [Side.Left]: 0,
          [Side.Right]: 20,
        },
        message: "Kick has longer reach!",
      });
    });
  });

  describe("Mid attack", () => {
    it("should beat high", () => {
      expect(resolveAttack(kickMidLight, kickHighLight)).toEqual({
        damage: {
          [Side.Left]: 0,
          [Side.Right]: 20,
        },
        message: "Mid has longer reach!",
      });
    });
    it("should beat low", () => {
      expect(resolveAttack(kickMidLight, kickLowLight)).toEqual({
        damage: {
          [Side.Left]: 0,
          [Side.Right]: 20,
        },
        message: "Mid has longer reach!",
      });
    });
    it("should lose to air", () => {
      expect(resolveAttack(kickMidLight, kickAirLight)).toEqual({
        damage: {
          [Side.Left]: 20,
          [Side.Right]: 0,
        },
        message: "Air attack!",
      });
    });
  });
});

describe("calculateDamage", () => {
  it("should calculate damage", () => {
    // Punches
    expect(calculateDamage(punchMidLight)).toEqual(10);
    expect(calculateDamage(punchMidMedium)).toEqual(15);
    expect(calculateDamage(punchMidHeavy)).toEqual(20);
    // kicks
    expect(calculateDamage(kickMidLight)).toEqual(20);
    expect(calculateDamage(kickMidMedium)).toEqual(30);
    expect(calculateDamage(kickMidHeavy)).toEqual(40);
  });
});
