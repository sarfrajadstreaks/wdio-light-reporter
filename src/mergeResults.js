const fs = require("fs");
const path = require("path");
const { renderFile } = require("pug");
const mergeResults = (...args) => {
  const dir = path.join(process.cwd(), args[0]);
  const suiteName =
    args[1][args[1].length - 2] === "--suite"
      ? args[1][args[1].length - 1]
      : "default";
  const filePattern = `results_${suiteName}_`;
  const rawData = getDataFromFiles(dir, filePattern);
  const mergedResults = mergeData(rawData, suiteName);
  writeFile(dir, mergedResults, suiteName);
  generateReport(dir, mergedResults);
};
function getFiles(dir, filePattern) {
  let files = fs.readdirSync(dir).filter(function (file) {
    return file.match(filePattern);
  });
  return files;
}
function getDataFromFiles(dir, filePattern) {
  const fileNames = getFiles(dir, filePattern);
  const data = [];
  fileNames.forEach((fileName) => {
    data.push(JSON.parse(fs.readFileSync(`${dir}/${fileName}`)));
  });
  return { data, fileNames };
}

function mergeData(rawData, suiteName) {
  let mergeResults;
  let fileNames = rawData.fileNames;
  let reference;
  rawData.data.forEach((data) => {
    if (mergeResults === undefined) {
      mergeResults = {
        reportType: "suiteReport",
        suiteName: suiteName,
        stats: {
          scenarios: 0,
          tests: 0,
          passes: 0,
          pending: 0,
          failures: 0,
          start: "",
          end: "",
          duration: 0,
          testsRegistered: 0,
          passPercent: 0,
          pendingPercent: 0,
          skipped: 0,
          timeStamp: "",
        },
        scenarios: [],
        developer: "https://github.com/sarfrajadstreaks",
        copyright: new Date().getFullYear(),
      };
    }
    reference = mergeResults;
    reference.stats.scenarios += data.stats.scenarios;
    reference.stats.tests += data.stats.tests;
    reference.stats.passes += data.stats.passes;
    reference.stats.skipped += data.stats.skipped;
    reference.stats.failures += data.stats.failures;
    if (reference.stats.start === "") {
      reference.stats.start = data.stats.start;
    }
    if (
      reference.stats.start != "" &&
      new Date(data.stats.start).getTime() <
        new Date(reference.stats.start).getTime()
    ) {
      reference.stats.start = data.stats.start;
    }
    if (reference.stats.end === "") {
      reference.stats.end = data.stats.end;
    }
    if (
      reference.stats.end != "" &&
      new Date(data.stats.end).getTime() >
        new Date(reference.stats.end).getTime()
    ) {
      reference.stats.end = data.stats.end;
    }
    reference.stats.duration = Math.abs(
      new Date(reference.stats.end) - new Date(reference.stats.start)
    );
    reference.stats.passPercent = data.stats.passPercent; ///  ****
    reference.stats.failurePercent = data.stats.failurePercent; ///  ****

    reference.scenarios = reference.scenarios.concat(data.scenarios);
  });
  return { mergeResults, fileNames };
}

function writeFile(dir, mergedResults, suiteName) {
  let filePath = "";
  var timeStamp = new Date()
    .toLocaleString()
    .replace(/\/|:/g, "-")
    .replace(", ", "_");
  mergedResults.mergeResults.stats.timeStamp = timeStamp;
  filePath = path.join(
    dir,
    "runReport_" + suiteName + "_" + timeStamp + ".json"
  );
  fs.writeFileSync(filePath, JSON.stringify(mergedResults.mergeResults));
}
function generateReport(dir, mergedData) {
  const options = { pretty: true };
  try {
    const res = renderFile(
      path.join(__dirname, "./suite_template.pug"),
      Object.assign(mergedData.mergeResults, options)
    );
    fs.writeFileSync(path.join(dir, "index.html"), res);
  } catch (error) {
    console.error(error);
  }
}
module.exports = mergeResults;
