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
    this.envs = env;
  }

  incrementScenarios() {
    this.scenarios += 1;
  }

  incrementTests(result) {
    this.tests += 1;
    if (result.pass) {
      this.passes += 1;
    } else if (result.fail) {
      this.failures += 1;
    } else if (result.skipped) {
      this.skipped += 1;
    }
  }
};
