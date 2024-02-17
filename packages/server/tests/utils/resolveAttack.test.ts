import { calculateDamage, resolveAttack } from "../../src/utils/resolveAttack";
import { Card, Guard, Reach, Side, Weight } from "../../src/types";

const punchMidLight: Card = {
  image: "punchMidLight.png",
  guard: Guard.Mid,
  reach: Reach.Punch,
  weight: Weight.Light,
};
const punchMidMedium: Card = {
  ...punchMidLight,
  image: "punchMidMedium.png",
  weight: Weight.Medium,
};
const punchMidHeavy: Card = {
  ...punchMidLight,
  image: "punchMidHeavy.png",
  weight: Weight.Heavy,
};

const kneeMidLight: Card = {
  image: "kneeMidLight.png",
  guard: Guard.Mid,
  reach: Reach.Knee,
  weight: Weight.Light,
};

const kickMidLight: Card = {
  image: "kickMidLight.png",
  guard: Guard.Mid,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickMidMedium: Card = {
  ...kickMidLight,
  image: "kickMidMedium.png",
  weight: Weight.Medium,
};
const kickMidHeavy: Card = {
  ...kickMidLight,
  image: "kickMidHeavy.png",
  weight: Weight.Heavy,
};

const kickHighLight: Card = {
  image: "kickHighLight.png",
  guard: Guard.High,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickLowLight: Card = {
  image: "kickLowLight.png",
  guard: Guard.Low,
  reach: Reach.Kick,
  weight: Weight.Light,
};
const kickAirLight: Card = {
  image: "kickAirLight.png",
  guard: Guard.Air,
  reach: Reach.Kick,
  weight: Weight.Light,
};

describe("resolveDamage", () => {
  describe("when guard, reach and weight matches", () => {
    it("should tie", () => {
      expect(resolveAttack(punchMidLight, punchMidLight)).toEqual("Tie!");
    });
  });

  describe("when longer reach", () => {
    it("should have advantage", () => {
      expect(resolveAttack(punchMidLight, kickMidLight)).toEqual([
        0,
        {
          guard: 1,
          image: "kickMidLight.png",
          reach: 5,
          weight: 1,
        },
      ]);
    });
  });

  describe("when weight is lighter", () => {
    it("should have advantage", () => {
      expect(resolveAttack(punchMidLight, punchMidMedium)).toEqual([
        0,
        {
          guard: 1,
          image: "punchMidMedium.png",
          reach: 3,
          weight: 2,
        },
      ]);
    });
  });

  describe("when crouching", () => {
    describe("against mid attack", () => {
      it("should have advantage", () => {
        expect(resolveAttack(kickAirLight, kickMidLight)).toEqual([
          0,
          { guard: 3, image: "kickAirLight.png", reach: 5, weight: 1 },
        ]);
      });
    });

    describe("against high attack", () => {
      it("should be antiaired", () => {
        expect(resolveAttack(kickAirLight, kickHighLight)).toEqual([
          1,
          { guard: 2, image: "kickHighLight.png", reach: 5, weight: 1 },
        ]);
      });
    });

    describe("against air attack", () => {
      it("should whiff", () => {
        expect(resolveAttack(kickAirLight, kickLowLight)).toEqual([
          1,
          { guard: 3, image: "kickAirLight.png", reach: 5, weight: 1 },
        ]);
      });
    });
  });

  describe("knee", () => {
    it("should be shorter than kick", () => {
      expect(resolveAttack(kickMidLight, kneeMidLight)).toEqual([
        1,
        { guard: 1, image: "kickMidLight.png", reach: 5, weight: 1 },
      ]);
    });
  });

  describe("Mid attack", () => {
    it("should beat high", () => {
      expect(resolveAttack(kickMidLight, kickHighLight)).toEqual([
        1,
        { guard: 1, image: "kickMidLight.png", reach: 5, weight: 1 },
      ]);
    });
    it("should beat low", () => {
      expect(resolveAttack(kickMidLight, kickLowLight)).toEqual([
        1,
        { guard: 1, image: "kickMidLight.png", reach: 5, weight: 1 },
      ]);
    });
    it("should lose to air", () => {
      expect(resolveAttack(kickMidLight, kickAirLight)).toEqual([
        1,
        { guard: 3, image: "kickAirLight.png", reach: 5, weight: 1 },
      ]);
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
