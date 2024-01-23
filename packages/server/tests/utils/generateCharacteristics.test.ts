import { generateAttributes } from "../../src/utils/generateCharacteristics";

describe("generateCharacteristics", () => {
  it("should generate characteristics", () => {
    const attributes = generateAttributes();
    expect(attributes).toHaveProperty("strength");
    expect(attributes).toHaveProperty("stamina");
    expect(attributes).toHaveProperty("speed");
    expect(attributes).toHaveProperty("reach");
    expect(attributes).toHaveProperty("reflexes");
    expect(attributes).toHaveProperty("technique");

    Object.values(attributes).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });
});
