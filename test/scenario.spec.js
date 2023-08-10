import Scenario from "../src/scenario";
import Test from "../src/test";

describe("Scenario Class Tests", () => {
  it("Should successfully instantiate a ROOT scenario", () => {
    const scenario = new Scenario(true, { title: "" });

    expect(scenario.root).toBe(true);
    expect(scenario.rootEmpty).toBe(undefined);
  });
});
