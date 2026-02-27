const path = require("path");
const fs = require("fs");

/**
 * Since mergeResults.js uses module-level requires and top-level functions,
 * we test the internal logic by requiring the module and mocking fs/pug.
 */

// We need to extract the internal helpers for unit testing.
// The cleanest approach: re-require the module with mocked dependencies.

jest.mock("pug", () => ({
  renderFile: jest.fn(() => "<html>mock report</html>"),
}));

describe("mergeResults", () => {
  const mergeResults = require("../src/mergeResults");

  function createResultFile(overrides = {}) {
    return {
      suites: "default",
      userFileName: "test-report",
      copyrightYear: 2026,
      developer: "Sarfraj",
      stats: {
        scenarios: 1,
        tests: 2,
        passes: 1,
        skipped: 1,
        failures: 0,
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-01-01T00:01:00.000Z",
        duration: 60000,
        envs: ["chrome", "100_0_0", "linux"],
      },
      scenarios: [
        {
          title: "Sample Scenario",
          uuid: "sc-1",
          tests: [{ title: "test 1", uuid: "t-1", state: "passed" }],
          passes: ["t-1"],
          failures: [],
          skipped: [],
          duration: 500,
          context: [],
        },
      ],
      ...overrides,
    };
  }

  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "wdio-lr-"));
  });

  afterEach(() => {
    // Clean up temp directory
    fs.readdirSync(tmpDir).forEach((f) => fs.unlinkSync(path.join(tmpDir, f)));
    fs.rmdirSync(tmpDir);
  });

  it("should merge a single result file and produce a run report JSON", () => {
    const data = createResultFile();
    fs.writeFileSync(
      path.join(tmpDir, "results_default_123_456.json"),
      JSON.stringify(data)
    );

    // mergeResults expects a relative path from cwd
    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    // Should have created a runReport JSON
    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    expect(reportJson).toBeDefined();

    const report = JSON.parse(
      fs.readFileSync(path.join(tmpDir, reportJson), "utf-8")
    );
    expect(report.reportType).toBe("suiteReport");
    expect(report.suiteName).toBe("default");
    expect(report.stats.tests).toBe(2);
    expect(report.stats.passes).toBe(1);
    expect(report.stats.skipped).toBe(1);
    expect(report.stats.failures).toBe(0);
    expect(report.stats.scenarios).toBe(1);

    // Verify nested runs structure
    expect(report.runs.linux).toBeDefined();
    expect(report.runs.linux.default).toBeDefined();
    expect(report.runs.linux.default.chrome).toBeDefined();
    expect(report.runs.linux.default.chrome["100_0_0"]).toBeDefined();
    expect(report.runs.linux.default.chrome["100_0_0"].stats.tests).toBe(2);
    expect(report.runs.linux.default.chrome["100_0_0"].scenarios).toHaveLength(1);
  });

  it("should merge multiple result files from different environments", () => {
    const chromeData = createResultFile();
    const firefoxData = createResultFile({
      stats: {
        scenarios: 1,
        tests: 3,
        passes: 2,
        skipped: 0,
        failures: 1,
        start: "2026-01-01T00:00:30.000Z",
        end: "2026-01-01T00:02:00.000Z",
        duration: 90000,
        envs: ["firefox", "98_0_0", "linux"],
      },
      scenarios: [
        {
          title: "Firefox Scenario",
          uuid: "sc-2",
          tests: [
            { title: "fx test 1", uuid: "t-2", state: "passed" },
            { title: "fx test 2", uuid: "t-3", state: "failed" },
          ],
          passes: ["t-2"],
          failures: ["t-3"],
          skipped: [],
          duration: 800,
          context: [],
        },
      ],
    });

    fs.writeFileSync(
      path.join(tmpDir, "results_default_100_1.json"),
      JSON.stringify(chromeData)
    );
    fs.writeFileSync(
      path.join(tmpDir, "results_default_100_2.json"),
      JSON.stringify(firefoxData)
    );

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    const report = JSON.parse(
      fs.readFileSync(path.join(tmpDir, reportJson), "utf-8")
    );

    // Aggregated stats
    expect(report.stats.tests).toBe(5);
    expect(report.stats.passes).toBe(3);
    expect(report.stats.skipped).toBe(1);
    expect(report.stats.failures).toBe(1);
    expect(report.stats.scenarios).toBe(2);
    expect(report.stats.envs).toHaveLength(2);

    // Both browsers present under linux
    expect(report.runs.linux.default.chrome).toBeDefined();
    expect(report.runs.linux.default.firefox).toBeDefined();

    // Uses the earliest start
    expect(report.stats.start).toBe("2026-01-01T00:00:00.000Z");
    // Uses the latest end
    expect(report.stats.end).toBe("2026-01-01T00:02:00.000Z");
  });

  it("should merge results from the same env/browser into one bucket", () => {
    const data1 = createResultFile();
    const data2 = createResultFile({
      stats: {
        scenarios: 1,
        tests: 1,
        passes: 0,
        skipped: 0,
        failures: 1,
        start: "2026-01-01T00:01:00.000Z",
        end: "2026-01-01T00:02:00.000Z",
        duration: 60000,
        envs: ["chrome", "100_0_0", "linux"],
      },
      scenarios: [
        {
          title: "Second Scenario",
          uuid: "sc-3",
          tests: [{ title: "fail test", uuid: "t-4", state: "failed" }],
          passes: [],
          failures: ["t-4"],
          skipped: [],
          duration: 300,
          context: [],
        },
      ],
    });

    fs.writeFileSync(
      path.join(tmpDir, "results_default_200_1.json"),
      JSON.stringify(data1)
    );
    fs.writeFileSync(
      path.join(tmpDir, "results_default_200_2.json"),
      JSON.stringify(data2)
    );

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    const report = JSON.parse(
      fs.readFileSync(path.join(tmpDir, reportJson), "utf-8")
    );

    const bucket = report.runs.linux.default.chrome["100_0_0"];
    expect(bucket.scenarios).toHaveLength(2);
    expect(bucket.stats.tests).toBe(3);
    expect(bucket.stats.passes).toBe(1);
    expect(bucket.stats.failures).toBe(1);
  });

  it("should handle envs with a 4th segment (profile)", () => {
    const data = createResultFile({
      stats: {
        scenarios: 1,
        tests: 1,
        passes: 1,
        skipped: 0,
        failures: 0,
        start: "2026-01-01T00:00:00.000Z",
        end: "2026-01-01T00:01:00.000Z",
        duration: 60000,
        envs: ["chrome", "100_0_0", "linux", "myprofile"],
      },
    });

    fs.writeFileSync(
      path.join(tmpDir, "results_default_300_1.json"),
      JSON.stringify(data)
    );

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    const report = JSON.parse(
      fs.readFileSync(path.join(tmpDir, reportJson), "utf-8")
    );

    expect(report.runs.linux.myprofile).toBeDefined();
    expect(report.runs.linux.myprofile.chrome["100_0_0"]).toBeDefined();
    expect(report.runs.linux.myprofile.chrome["100_0_0"].stats.tests).toBe(1);
  });

  it("should skip unparseable files and still merge valid ones", () => {
    const data = createResultFile();
    fs.writeFileSync(
      path.join(tmpDir, "results_default_400_1.json"),
      JSON.stringify(data)
    );
    fs.writeFileSync(
      path.join(tmpDir, "results_default_400_2.json"),
      "NOT VALID JSON{{{{"
    );

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Could not parse"),
      expect.any(String)
    );
    warnSpy.mockRestore();

    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    expect(reportJson).toBeDefined();
  });

  it("should generate an HTML report file", () => {
    const pug = require("pug");
    const data = createResultFile();
    fs.writeFileSync(
      path.join(tmpDir, "results_default_500_1.json"),
      JSON.stringify(data)
    );

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    expect(pug.renderFile).toHaveBeenCalled();

    const files = fs.readdirSync(tmpDir);
    const htmlFile = files.find((f) => f.endsWith(".html"));
    expect(htmlFile).toBe("test-report.html");
  });

  it("should not have pending field in stats (fixed skipped/pending mismatch)", () => {
    const data = createResultFile();
    fs.writeFileSync(
      path.join(tmpDir, "results_default_600_1.json"),
      JSON.stringify(data)
    );

    const origCwd = process.cwd;
    process.cwd = () => "/";
    try {
      mergeResults(tmpDir);
    } finally {
      process.cwd = origCwd;
    }

    const files = fs.readdirSync(tmpDir);
    const reportJson = files.find((f) => f.startsWith("runReport_"));
    const report = JSON.parse(
      fs.readFileSync(path.join(tmpDir, reportJson), "utf-8")
    );

    // Should have skipped, not pending
    expect(report.stats.skipped).toBeDefined();
    expect(report.stats.pending).toBeUndefined();
  });
});
