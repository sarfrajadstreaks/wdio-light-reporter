module.exports = class {
  constructor(start, env) {
    this.scenarios = 0;
    this.tests = 0;
    this.passes = 0;
    this.skipped = 0;
    this.failures = 0;
    this.start = start;
    this.end = "";
    this.duration = 0;
    this.passPercent = 0;
    this.failurePercent = 0;
    this.skippedPercent = 0;
    this.envs = env;
  }

  incrementScenarios() {
    this.scenarios += 1;
  }

  incrementTests(result) {
    this.tests += 1;
    this.testsRegistered += 1;
    if (result.pass) {
      this.passes += 1;
    } else if (result.fail) {
      this.failures += 1;
    } else if (result.pending) {
      this.pending += 1;
      this.skipped += 1;
      this.hasSkipped = true;
    }

    this.passPercent =
      this.tests === 0 ? 0 : Math.round((this.passes / this.tests) * 100);
    this.failurePercent =
      this.tests === 0
        ? 0
        : Math.round((this.failurePercent / this.tests) * 100);
    this.skippedPercent =
      this.tests === 0 ? 0 : 100 - (this.failurePercent + this.passPercent);
  }
};
