import Stats from "../src/stats.js";

describe("Stats Class tests", () => {
  it("Should successfully increment the Scenario Count", () => {
    const stats = new Stats();
    stats.incrementScenarios(0);
    expect(stats.scenarios).toBe(1);
  });

  it("Should successfully increment a Passing Test", () => {
    const stats = new Stats();
    stats.incrementTests({ pass: true });

    expect(stats.tests).toBe(1);
    expect(stats.passes).toBe(1);
  });

  it("Should successfully increment a Failing Test", () => {
    const stats = new Stats();
    stats.incrementTests({ fail: true });

    expect(stats.tests).toBe(1);
    expect(stats.failures).toBe(1);
  });
  it("Should successfully capture the env parameters", () => {
    const stats = new Stats("", ["Chrome", "99_0_1", "macosX"]);
    expect(stats.envs[0]).toBe("Chrome");
    expect(stats.envs[1]).toBe("99_0_1");
    expect(stats.envs[2]).toBe("macosX");
  });
});
