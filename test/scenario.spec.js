import Scenario from "../src/scenario.js";
import Test from "../src/test.js";

describe("Scenario Class Tests", () => {
  it("Should successfully instantiate a ROOT scenario", () => {
    const scenario = new Scenario(true, { title: "" });

    expect(scenario.root).toBe(true);
    expect(scenario.rootEmpty).toBe(undefined);
  });
});
