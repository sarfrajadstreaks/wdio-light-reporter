const path = require("path");
const fs = require("fs");

// This demo test requires a ./TestData directory with result files.
// Skip gracefully if the directory doesn't exist.
const testDataDir = path.join(process.cwd(), "./TestData");

if (fs.existsSync(testDataDir)) {
  const mergeResults = require("../src/mergeResults");
  test("demo mergeResults", () => {
    mergeResults("./TestData");
  });
} else {
  test.skip("demo mergeResults (TestData directory not found)", () => {});
}
