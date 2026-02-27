const fs = require("fs");
const path = require("path");
const { renderFile } = require("pug");

const mergeResults = (...args) => {
  const dir = path.join(process.cwd(), args[0]);
  const filePattern = `results_*`;
  const rawData = getDataFromFiles(dir, filePattern);
  const mergedResults = mergeData(rawData);
  writeFile(dir, mergedResults);
  generateReport(dir, mergedResults, rawData.data[0].userFileName);
};

function getFiles(dir, filePattern) {
  return fs.readdirSync(dir).filter(function (file) {
    return file.match(filePattern);
  });
}

function getDataFromFiles(dir, filePattern) {
  const fileNames = getFiles(dir, filePattern);
  const data = [];
  fileNames.forEach((fileName) => {
    try {
      const tempData = fs.readFileSync(`${dir}/${fileName}`);
      const tempJson = JSON.parse(tempData);
      data.push(tempJson);
    } catch (error) {
      console.warn(`Warning: Could not parse result file "${fileName}":`, error.message);
    }
  });
  return { data, fileNames };
}

function createStatsData() {
  return {
    scenarios: 0,
    tests: 0,
    passes: 0,
    skipped: 0,
    failures: 0,
    start: "",
    end: "",
    duration: 0,
    timeStamp: "",
    envs: [],
  };
}

function updateStats(ref, data, root) {
  ref.scenarios += data.stats.scenarios;
  ref.tests += data.stats.tests;
  ref.passes += data.stats.passes;
  ref.skipped += data.stats.skipped;
  ref.failures += data.stats.failures;
  if (root) {
    if (!ref.envs.includes(data.stats.envs.toLocaleString())) {
      ref.envs.push(data.stats.envs.toLocaleString());
    }
  }

  if (ref.start === "") {
    ref.start = data.stats.start;
  }
  if (
    ref.start !== "" &&
    new Date(data.stats.start).getTime() < new Date(ref.start).getTime()
  ) {
    ref.start = data.stats.start;
  }
  if (ref.end === "") {
    ref.end = data.stats.end;
  }
  if (
    ref.end !== "" &&
    new Date(data.stats.end).getTime() > new Date(ref.end).getTime()
  ) {
    ref.end = data.stats.end;
  }
  ref.duration = Math.abs(new Date(ref.end) - new Date(ref.start));
}

/**
 * Navigates into the nested runs object, creating intermediate keys as needed.
 * Returns the leaf node for [platform][profile][browser][version].
 */
function getOrCreateRunBucket(runs, envs) {
  const platform = envs[2];
  const profile = envs[3] !== undefined ? envs[3] : "default";
  const browser = envs[0];
  const version = envs[1];

  if (runs[platform] === undefined) {
    runs[platform] = {};
  }
  if (runs[platform][profile] === undefined) {
    runs[platform][profile] = {};
  }
  if (runs[platform][profile][browser] === undefined) {
    runs[platform][profile][browser] = {};
  }
  if (runs[platform][profile][browser][version] === undefined) {
    runs[platform][profile][browser][version] = {
      stats: createStatsData(),
      scenarios: [],
    };
  }
  return runs[platform][profile][browser][version];
}

function mergeData(rawData) {
  let mergedResult;
  const fileNames = rawData.fileNames;

  rawData.data.forEach((data) => {
    if (mergedResult === undefined) {
      mergedResult = {
        reportType: "suiteReport",
        suiteName: data.suites,
        userFileName: data.userFileName,
        stats: createStatsData(),
        runs: {},
        developer: "https://github.com/sarfrajadstreaks",
        copyright: new Date().getFullYear(),
      };
    }

    updateStats(mergedResult.stats, data, true);

    const bucket = getOrCreateRunBucket(mergedResult.runs, data.stats.envs);
    updateStats(bucket.stats, data);
    bucket.scenarios = bucket.scenarios.concat(data.scenarios);
  });

  return { mergeResults: mergedResult, fileNames };
}

function writeFile(dir, mergedResults) {
  const timeStamp = new Date()
    .toLocaleString()
    .replace(/\/|:/g, "-")
    .replace(", ", "_");
  mergedResults.mergeResults.stats.timeStamp = timeStamp;
  const filePath = path.join(dir, "runReport_" + timeStamp + ".json");
  fs.writeFileSync(filePath, JSON.stringify(mergedResults.mergeResults));
}

function generateReport(dir, mergedData, userFileName) {
  const options = { pretty: true };
  try {
    const res = renderFile(
      path.join(__dirname, "./suite_template.pug"),
      Object.assign(mergedData.mergeResults, options)
    );
    fs.writeFileSync(path.join(dir, userFileName + ".html"), res);
    mergedData.fileNames.forEach((fileName) => {
      fs.unlinkSync(dir + "/" + fileName);
    });
  } catch (error) {
    console.error("Failed to generate HTML report:", error);
  }
}

module.exports = mergeResults;
