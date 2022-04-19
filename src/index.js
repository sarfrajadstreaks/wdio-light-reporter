const WDIOReporter = require("@wdio/reporter").default;
const Scenarios = require("./scenario");
const Stats = require("./stats");
const Test = require("./test");
const process = require("process");
class WdioLightReporter extends WDIOReporter {
  constructor(options) {
    options = Object.assign(options);
    if (process.argv[process.argv.length - 2] === "--suite") {
      options.logFile =
        "result_" +
        process.argv[process.argv.length - 1] +
        Date.now() +
        process.pid +
        ".json";
    } else {
      options.logFile = "result_default" + Date.now() + process.pid + ".json";
    }
    super(options);
    this.registerListeners();
  }

  onRunnerStart(runner) {
    this.config = runner.config;
    this.sanitizedCaps = runner.sanitizedCapabilities;
    if (runner.isMultiremote) {
      this.sessionId = {};
      for (const name in runner.capabilities) {
        this.sessionId[name] = runner.capabilities[name].sessionId;
      }
    } else {
      this.sessionId = runner.sessionId;
    }
    this.testsuite = "";
    if (process.argv[process.argv.length - 2] === "--suite") {
      this.testsuite = process.argv[process.argv.length - 1];
    }
    if (this.testsuite == "") {
      this.testsuite = "default";
    }
    this.results = {
      stats: new Stats(runner.start),
      scenarios: [],
      suites: this.testsuite,
      copyrightYear: new Date().getFullYear(),
      developer: "Sarfraj",
    };
  }

  onSuiteStart(scenario) {
    this.currSuite = new Scenarios(false, scenario, this.sanitizedCaps);
    this.results.stats.incrementScenarios();
  }

  onTestStart(test) {
    this.currTest = new Test(test, this.currSuite.uuid);
    //this.currTest.addSessionContext(this.sessionId);
  }

  onTestSkip(test) {
    this.currTest = new Test(test, this.currSuite.uuid);
    this.currTest.addSessionContext(this.sessionId);
  }

  onAfterCommand(cmd) {
    const isScreenshotEndpoint = /\/session\/[^/]*\/screenshot/;
    if (isScreenshotEndpoint.test(cmd.endpoint) && cmd.result.value) {
      this.currTest.addScreenshotContext(cmd.result.value);
    }
  }

  onTestEnd(test) {
    this.currTest.duration = test._duration;
    this.currTest.updateResult(test);
    this.currTest.context = JSON.stringify(this.currTest.context);
    this.currSuite.addTest(this.currTest);
    this.results.stats.incrementTests(this.currTest);
  }

  onSuiteEnd(suite) {
    this.currSuite.duration = suite.duration;
    this.results.scenarios.push(this.currSuite);
    // console.log(JSON.stringify(this.results))
  }

  onRunnerEnd(runner) {
    this.results.stats.end = runner.end;
    this.results.stats.duration = runner.duration;
    this.write(JSON.stringify(this.results));
  }

  // addContext functionality
  registerListeners() {
    process.on(
      "wdio-mochawesome-reporter:addContext",
      this.addSomeContext.bind(this)
    );
  }

  addSomeContext(object) {
    this.currTest.context.push(object);
  }

  static addContext(context) {
    process.emit("wdio-mochawesome-reporter:addContext", context);
  }
  static addStep(context) {
    process.emit("wdio-mochawesome-reporter:addContext", context);
  }
}

exports.default = WdioLightReporter;
