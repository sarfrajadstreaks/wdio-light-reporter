const Scenario = require("../src/scenario");
const Test = require("../src/test");

describe("Scenario Class Tests", () => {
  it("Should successfully instantiate a ROOT scenario", () => {
    const scenario = new Scenario(true, { title: "" });

    expect(scenario.root).toBe(true);
    expect(scenario.rootEmpty).toBe(undefined);
  });
});
