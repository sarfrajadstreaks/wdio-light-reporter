/**
 * Generates a sample HTML report for visual testing.
 * Run: node preview_report.js
 * Then open: preview_report.html in your browser
 */
const { renderFile } = require("pug");
const fs = require("fs");
const path = require("path");

const sampleData = {
  reportType: "suiteReport",
  suiteName: "Visual Test Suite",
  userFileName: "preview_report",
  stats: {
    tests: 12,
    passes: 8,
    failures: 2,
    skipped: 2,
    envs: [
      "chrome,102_0_5005_61,linux,default",
      "firefox,101_0,macOS,default",
    ],
    timeStamp: new Date().toLocaleString(),
  },
  runs: {
    linux: {
      default: {
        chrome: {
          "102_0_5005_61": {
            stats: { tests: 7, passes: 5, failures: 1, skipped: 1 },
            scenarios: [
              {
                title: "Login Functionality",
                uuid: "sc-001",
                duration: "1234",
                tests: [
                  {
                    title: "should login with valid credentials",
                    uuid: "tc-001",
                    state: "passed",
                    context: JSON.stringify(["Navigated to login page", "Entered username", "Entered password", "Clicked submit"]),
                    err: {},
                  },
                  {
                    title: "should show error for invalid password",
                    uuid: "tc-002",
                    state: "passed",
                    context: JSON.stringify(["Navigated to login page", "Entered username", "Entered wrong password"]),
                    err: {},
                  },
                  {
                    title: "should redirect to dashboard after login",
                    uuid: "tc-003",
                    state: "failed",
                    context: JSON.stringify([]),
                    err: {
                      stack: "AssertionError: expected '/login' to equal '/dashboard'\n    at Context.<anonymous> (test/login.spec.js:45:18)\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)",
                    },
                  },
                  {
                    title: "should handle forgotten password flow",
                    uuid: "tc-004",
                    state: "skipped",
                    context: JSON.stringify([]),
                    err: {},
                  },
                ],
                passes: [{ title: "t1" }, { title: "t2" }],
                failures: [{ title: "t3" }],
                skipped: [{ title: "t4" }],
                context: "",
              },
              {
                title: "User Profile Management",
                uuid: "sc-002",
                duration: "897",
                tests: [
                  {
                    title: "should display user profile info",
                    uuid: "tc-005",
                    state: "passed",
                    context: JSON.stringify(["Opened profile page", "Verified user name displayed"]),
                    err: {},
                  },
                  {
                    title: "should update email address",
                    uuid: "tc-006",
                    state: "passed",
                    context: JSON.stringify(["Clicked edit", "Changed email", "Saved successfully"]),
                    err: {},
                  },
                  {
                    title: "should upload avatar image",
                    uuid: "tc-007",
                    state: "passed",
                    context: JSON.stringify([
                      "Selected file",
                      { title: "Screenshot", value: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iMjQwIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iIzRhOTBkOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCI+U2NyZWVuc2hvdCBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==" },
                    ]),
                    err: {},
                  },
                ],
                passes: [{ title: "t5" }, { title: "t6" }, { title: "t7" }],
                failures: [],
                skipped: [],
                context: "Additional context: Profile tests run against staging environment",
              },
            ],
          },
        },
      },
    },
    macOS: {
      default: {
        firefox: {
          "101_0": {
            stats: { tests: 5, passes: 3, failures: 1, skipped: 1 },
            scenarios: [
              {
                title: "Search & Filter",
                uuid: "sc-003",
                duration: "2100",
                tests: [
                  {
                    title: "should search by keyword",
                    uuid: "tc-008",
                    state: "passed",
                    context: JSON.stringify(["Entered search term", "Results displayed"]),
                    err: {},
                  },
                  {
                    title: "should filter by category",
                    uuid: "tc-009",
                    state: "passed",
                    context: JSON.stringify(["Selected category", "Filtered results shown"]),
                    err: {},
                  },
                  {
                    title: "should paginate results",
                    uuid: "tc-010",
                    state: "failed",
                    context: JSON.stringify([]),
                    err: {
                      stack: "TimeoutError: Waiting for element '.pagination-next' timed out after 10000ms\n    at Context.<anonymous> (test/search.spec.js:78:22)",
                    },
                  },
                  {
                    title: "should sort results by date",
                    uuid: "tc-011",
                    state: "passed",
                    context: JSON.stringify(["Clicked sort by date", "Results reordered"]),
                    err: {},
                  },
                  {
                    title: "should handle empty search results",
                    uuid: "tc-012",
                    state: "skipped",
                    context: JSON.stringify([]),
                    err: {},
                  },
                ],
                passes: [{ title: "t8" }, { title: "t9" }, { title: "t11" }],
                failures: [{ title: "t10" }],
                skipped: [{ title: "t12" }],
                context: "",
              },
            ],
          },
        },
      },
    },
  },
  developer: "https://github.com/sarfrajadstreaks",
  copyright: new Date().getFullYear(),
  pretty: true,
};

try {
  const html = renderFile(path.join(__dirname, "src/suite_template.pug"), sampleData);
  const outPath = path.join(__dirname, "preview_report.html");
  fs.writeFileSync(outPath, html);
  console.log("✅ Report generated: " + outPath);
  console.log("Open it in your browser to visually inspect.");
} catch (err) {
  console.error("❌ Failed to generate report:", err);
}
