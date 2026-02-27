const WdioLightReporter = require("../src/index").default;

describe("Reporter Tests", () => {
  const runner = {
    sanitizedCapabilities: "chrome",
    sessionId: "123456",
  };
  let reporter;

  beforeEach(() => {
    process.removeAllListeners("wdio-light-reporter:addLabel");
    process.removeAllListeners("wdio-light-reporter:addDetail");
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
    // Create a reporter with screenshots enabled
    const screenshotReporter = new WdioLightReporter({ addScreenshots: true });
    screenshotReporter.onRunnerStart(runner);
    const scenario = { title: "sample scenario", uuid: "1234" };
    const test = { title: "this is a test", uuid: "9876" };
    const command = {
      endpoint: "/session/123456/screenshot/",
      result: { value: "abcdefg" },
    };
    screenshotReporter.onSuiteStart(scenario);
    screenshotReporter.onTestStart(test);

    screenshotReporter.onAfterCommand(command);
    expect(screenshotReporter.currTest.context[0]).toMatchObject({
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

  it("addLabel - adds context to current test", () => {
    const scenario = { title: "Login Suite" };
    const test = { title: "should display login page", uuid: "8888" };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    WdioLightReporter.addLabel("Login Suite Label");
    expect(reporter.currTest.context).toContainEqual("Login Suite Label");
  });

  it("addLabel - multiple labels on same test", () => {
    const scenario = { title: "Checkboxes Page" };
    const test = { title: "should display checkboxes", uuid: "7777" };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    WdioLightReporter.addLabel("Checkboxes Suite");
    WdioLightReporter.addLabel("Component: Form Controls");
    expect(reporter.currTest.context).toContainEqual("Checkboxes Suite");
    expect(reporter.currTest.context).toContainEqual("Component: Form Controls");
    expect(reporter.currTest.context.length).toBe(2);
  });

  it("addDetail - adds context to current suite", () => {
    const scenario = { title: "Dynamic Loading Page" };
    const test = { title: "should load element", uuid: "6666" };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    WdioLightReporter.addDetail("Priority: High | Type: Integration");
    expect(reporter.currSuite.context).toContainEqual("Priority: High | Type: Integration");
  });

  it("addDetail - multiple details on same suite", () => {
    const scenario = { title: "Advanced Suite" };
    const test = { title: "should run advanced test", uuid: "5555" };
    reporter.onSuiteStart(scenario);
    reporter.onTestStart(test);

    WdioLightReporter.addDetail("Module: Authentication");
    WdioLightReporter.addDetail("Expected: Intentional failure for report validation");
    expect(reporter.currSuite.context).toContainEqual("Module: Authentication");
    expect(reporter.currSuite.context).toContainEqual("Expected: Intentional failure for report validation");
  });

  it("addLabel - does not crash when no test is active", () => {
    expect(() => WdioLightReporter.addLabel("No test active")).not.toThrow();
  });

  it("addDetail - does not crash when no suite is active", () => {
    const freshReporter = new WdioLightReporter({});
    freshReporter.onRunnerStart(runner);
    expect(() => WdioLightReporter.addDetail("No suite active")).not.toThrow();
  });

  it("addLabel and addDetail together in a test flow", () => {
    const scenario = { title: "Login Page Tests" };
    const test1 = {
      title: "should display the login page",
      uuid: "4444",
      _duration: "200",
      state: "passed",
    };
    const test2 = {
      title: "should login with valid credentials",
      uuid: "3333",
      _duration: "500",
      state: "passed",
    };

    reporter.onSuiteStart(scenario);

    // First test with label and detail
    reporter.onTestStart(test1);
    WdioLightReporter.addLabel("Login Suite");
    WdioLightReporter.addDetail("Module: Authentication");
    reporter.onTestEnd(test1);

    // Verify label is serialized in test context
    expect(JSON.parse(reporter.currSuite.tests[0].context)).toContainEqual("Login Suite");
    // Verify detail is on the suite
    expect(reporter.currSuite.context).toContainEqual("Module: Authentication");

    // Second test with its own label
    reporter.onTestStart(test2);
    WdioLightReporter.addLabel("Valid Credentials Test");
    reporter.onTestEnd(test2);

    expect(JSON.parse(reporter.currSuite.tests[1].context)).toContainEqual("Valid Credentials Test");
    // First test should not have second test's label
    expect(JSON.parse(reporter.currSuite.tests[0].context)).not.toContainEqual("Valid Credentials Test");
  });
});
