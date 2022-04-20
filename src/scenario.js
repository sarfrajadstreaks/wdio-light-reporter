const uuid = require("uuid/v4");
module.exports = class {
  constructor(isRoot, data) {
    this.title = "";
    this.tests = [];
    this.root = isRoot;
    this.passes = [];
    this.failures = [];
    this.skipped = [];
    this.duration = 0;
    this.rootEmpty = data.rootEmpty;
    this._timeout = 0;
    this.uuid = uuid();
    this.beforeHooks = [];
    this.afterHooks = [];
    this.title = `${this.title}`;
    // if (!isRoot) {
    //   this.title = data.title;

    //   if (saniCaps) {
    //     this.title = `${this.title}`;
    //   }
    // }
  }

  addSuite(suite) {
    this.suites.push(suite);
  }

  addTest(test) {
    this.tests.push(test);
    if (test.pass) {
      this.passes.push(test.uuid);
    } else if (test.fail) {
      this.failures.push(test.uuid);
    } else if (test.pending) {
      this.pending.push(test.uuid);
      this.skipped.push(test.uuid);
    }
  }
};
