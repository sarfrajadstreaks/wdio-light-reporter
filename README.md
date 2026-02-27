# WDIO-LIGHT-REPORTER

## Inspired by HTML and Mochawesome reporter

> **Philosophy:** This reporter does not support Cucumber report regeneration and is developed keeping in mind the BDD and Mocha framework.
> Here, `describe()` section is considered as a test scenario and `it()` as a test case inside the test scenarios.

## FEATURES

1. Easy setup
2. Enhanced UI with Bootstrap 5
3. Screenshot embedded in HTML report
4. `addLabel()` to include step context or name
5. `addDetail()` to add context at the scenario level
6. Multi-environment run support with environment-based segregation
7. Expand/collapse all environments with tri-state checkbox
8. Share / Save as PDF from the navbar


## Releases
V 0.1.9 - Initial release
V 0.2.6
  1. Include multiple environment runs and segregate based on environment.
  2. Fix bugs
  3. Improved performance.
V 1.0.0 (latest)
  1. Redesigned UI with Bootstrap 5 and custom stat/chart cards.
  2. Environment cards with platform/browser icons and inline stats.
  3. Expand/collapse all with tri-state checkbox.
  4. Share button (Save as PDF).
  5. Responsive accordion headers that shrink before wrapping.
  6. Code cleanup and dead code removal.


## Installation

NPM

```sh
npm install wdio-light-reporter --save-dev
```

## Configuration

```js
reporters: ['dot', ['light', {
      outputDir: './Light_Results',       // default: './Light_Results'
      outputFile: 'demo',                 // html report filename (default: 'default')
      addScreenshots: false,              // embed screenshots in report (default: false)
  }]
],
```

## Screenshots

The reporter does not automatically take screenshots, but if manually configured, it listens to the event and attaches the screenshots in the HTML report.
**To include screenshots in the report, add the below code in the `afterTest()` hook in your wdio conf file:**

```js
afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (!passed) { await browser.takeScreenshot() }
},
```

## Result Files

Each run generates a JSON report for each spec file. To generate a combined JSON and HTML report, add the below code in the **`onComplete()`** hook in your wdio conf file:

```js
onComplete: function (exitCode, config, capabilities, results) {
    const mergeResults = require("wdio-light-reporter/src/mergeResults");
    mergeResults("./Light_Results");
},
```

> If you run your tests without any `--suite` option, it considers `default` as the suite.
> The reporter does not work if you provide multiple `--suite` parameters in a single run.
> `wdio run wdio.conf.js --suite firstSuite` — **(WORKS FINE)** :)
> `wdio run wdio.conf.js --suite firstSuite --suite secondSuite` — **(DOES NOT WORK)** :(

## Adding Context

### `addLabel()` — Add step-level context

Use `addLabel()` to add context to any test step. It will appear as step info in the report.

```js
const { addLabel } = require("wdio-light-reporter").default;

describe("Show how to use addLabel", () => {
  it("report will add this as steps/context in report", async () => {
      addLabel("Log Example 1 as step 1")
      console.log("Log Example 1")
      addLabel("Log Example 2 as step 2")
      console.log("Log Example 2")
  })
})
```

### `addDetail()` — Add scenario-level context

Use `addDetail()` to add context at the scenario (describe) level.

```js
const { addDetail } = require("wdio-light-reporter").default;

describe("Show how to use addDetail", () => {
  addDetail("This context will appear at the scenario level")
  it("some test case", async () => {
      // ...
  })
})
```

## License

MIT
**Free, Hell Yeah!**
