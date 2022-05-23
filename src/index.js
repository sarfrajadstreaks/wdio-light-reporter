const WDIOReporter = require("@wdio/reporter").default;
const Scenarios = require("./scenario");
const Stats = require("./stats");
const Test = require("./test");
const path = require("path");
const fs = require("fs");
const process = require("process");
class WdioLightReporter extends WDIOReporter {
  constructor(options) {
    options = Object.assign(options);
    if (options.outputDir === undefined) {
      options.outputDir = "./Light_Results";
    }
    if (process.argv[process.argv.length - 2] === "--suite") {
      options.logFile =
        options.outputDir +
        "/results_" +
        process.argv[process.argv.length - 1] +
        "_" +
        Date.now() +
        "_" +
        process.pid +
        ".json";
    } else {
      options.logFile =
        options.outputDir +
        "/results_default" +
        "_" +
        Date.now() +
        "_" +
        process.pid +
        ".json";
    }
    super(options);
    this.userFileName=options.outputFile || 'default'
    if(options.autoClean==true || options.autoClean==undefined){
      fs.readdirSync(options.outputDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
          fs.unlinkSync(path.join(options.outputDir, file), err => {
            if (err) throw err;
          });
        }
      });
    }
    this.registerListeners();
  }

  onRunnerStart(runner) {
    this.config = runner.config;
    this.sanitizedCaps = runner.sanitizedCapabilities;
    this.envs = runner.sanitizedCapabilities.split(".");
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
      stats: new Stats(runner.start, this.envs),
      scenarios: [],
      suites: this.testsuite,
      userFileName:this.userFileName,
      copyrightYear: new Date().getFullYear(),
      developer: "Sarfraj",
    };
  }

  onSuiteStart(scenario) {
    this.currSuite = new Scenarios(false, scenario);
    this.results.stats.incrementScenarios();
  }

  onTestStart(test) {
    this.currTest = new Test(test, this.currSuite.uuid);
  }

  onTestSkip(test) {
    this.currTest = new Test(test, this.currSuite.uuid);
  }

  onAfterCommand(cmd) {
    const isScreenshotEndpoint = /\/session\/[^\/]*\/screenshot/;
    const isScreenshotCommand="takeScreenshot"
    if ((isScreenshotEndpoint.test(cmd.endpoint)||cmd.command===isScreenshotCommand) && cmd.result.value) {
      this.currTest.addScreenshotContext(cmd.result.value);
    }
  }
  onTestFail(test){

  }
  onTestFail(test){

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
  }

  onRunnerEnd(runner) {
    this.results.stats.end = runner.end;
    this.results.stats.duration = runner.duration;
    this.write(JSON.stringify(this.results));
  }

  // addContext functionality
  registerListeners() {
    process.on("wdio-light-reporter:addLabel", this.addSomeContext.bind(this));
  }

  addSomeContext(object) {
    this.currTest.context.push(object);
  }

  static addLabel(context) {
    process.emit("wdio-light-reporter:addLabel", context);
  }
}

exports.default = WdioLightReporter;
