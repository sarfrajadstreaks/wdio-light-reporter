import WdioLightReporter from "../src/index.mjs";

describe("Reporter Tests", () => {
  const runner = {
    sanitizedCapabilities: "chrome",
    sessionId: "123456",
  };
  let reporter;

  beforeEach(() => {
    reporter = new WdioLightReporter({});
    reporter.onRunnerStart(runner);
  });

  it("onRunnerStart", () => {
    expect(reporter.results).toMatchObject({
      scenarios: expect.anything(),
      copyrightYear: expect.anything(),
      stats: expect.anything(),
      suites: expect.anything(),
    });
    expect(reporter.sanitizedCaps).toBe(runner.sanitizedCapabilities);
    expect(reporter.sessionId).toBe(runner.sessionId);
  });

  it("onSuiteStart", () => {
    const scenario = { title: "sample suite" };
    reporter.onSuiteStart(scenario);

    expect(reporter.results.stats.scenarios).toBe(1);
    expect(reporter.currSuite.title).toBe(`${scenario.title}`);
  });

  it("onTestStart", () => {
    const scenario = { title: "sample scenario", uuid: "1234" };
    const test = { title: "this is a test", uuid: "9876" };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    expect(reporter.currTest.title).toBe(test.title);
  });
  it("onAfterCommand", () => {
    const scenario = { title: "sample scenario", uuid: "1234" };
    const test = { title: "this is a test", uuid: "9876" };
    const command = {
      endpoint: "/session/123456/screenshot/",
      result: { value: "abcdefg" },
    };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    reporter.onAfterCommand(command);
    expect(reporter.currTest.context[0]).toMatchObject({
      title: "Screenshot",
      value: "data:image/jpeg;base64,abcdefg",
    });
  });

  it("onTestEnd", () => {
    const scenario = { title: "sample scenario", uuid: "1234" };
    const test = {
      title: "this is a test",
      uuid: "9876",
      _duration: "123",
      state: "passed",
    };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    reporter.onTestEnd(test);
    expect(reporter.currTest.duration).toBe(test._duration);
    expect(reporter.currTest.pass).toBe(true);
    expect(reporter.currSuite.tests.length).toBe(1);
    expect(reporter.results.stats.tests).toBe(1);
  });

  it("onTestEnd - skipped", () => {
    const scenario = { title: "sample scenario", uuid: "1234" };
    const test = {
      title: "this is a test",
      uuid: "9876",
      _duration: "123",
      state: "skipped",
    };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    reporter.onTestEnd(test);
    expect(reporter.currTest.duration).toBe(test._duration);
    expect(reporter.currSuite.tests.length).toBe(1);
    expect(reporter.results.stats.tests).toBe(1);
  });

  it("onSuiteEnd", () => {
    const scenario = {
      title: "sample scenario",
      uuid: "1234",
      duration: "897",
    };
    const test = {
      title: "this is a test",
      uuid: "9876",
      _duration: "123",
      state: "passed",
    };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);
    reporter.onTestEnd(test);

    reporter.onSuiteEnd(scenario);
    console.log(reporter.results);
    expect(reporter.currSuite.duration).toBe(scenario.duration);
    expect(reporter.results.stats.scenarios).toBe(1);
  });

  it("onRunnerEnd", () => {
    reporter.write = jest.fn();
    runner.end = "1234567890";
    runner.duration = "9987";

    reporter.onRunnerEnd(runner);
    expect(reporter.results.stats.end).toBe(runner.end);
    expect(reporter.results.stats.duration).toBe(runner.duration);
  });
});
