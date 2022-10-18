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
  let files = fs.readdirSync(dir).filter(function (file) {
    return file.match(filePattern);
  });
  return files;
}
function getDataFromFiles(dir, filePattern) {
  const fileNames = getFiles(dir, filePattern);
  const data = [];
  fileNames.forEach((fileName) => {
    try {
      let tempData=fs.readFileSync(`${dir}/${fileName}`);
      let tempJson=JSON.parse(tempData);
      data.push(tempJson);
    } catch (error) {
      console.log("INDETERMINANT ISSUE")
    }
  
  });
  return { data, fileNames };
}
function updateStats(ref,data,root){
  ref.scenarios += data.stats.scenarios;
  ref.tests += data.stats.tests;
  ref.passes += data.stats.passes;
  ref.skipped += data.stats.skipped;
  ref.failures += data.stats.failures;
  if(root){
    if(!ref.envs.includes(data.stats.envs.toLocaleString()))
      ref.envs.push(data.stats.envs.toLocaleString());
  }
    
  if (ref.start === "") {
    ref.start = data.stats.start;
  }
  if (
    ref.start != "" &&
    new Date(data.stats.start).getTime() <
      new Date(ref.start).getTime()
  ) {
    ref.start = data.stats.start;
  }
  if (ref.end === "") {
    ref.end = data.stats.end;
  }
  if (
    ref.end != "" &&
    new Date(data.stats.end).getTime() >
      new Date(ref.end).getTime()
  ) {
    ref.end = data.stats.end;
  }
  ref.duration = Math.abs(
    new Date(ref.end) - new Date(ref.start)
  );
}
function mergeData(rawData) {
  let mergeResults;
  let fileNames = rawData.fileNames;
  let reference;
  let stats_data={
    scenarios: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0,
    start: "",
    end: "",
    duration: 0,
    skipped: 0,
    timeStamp: "",
    envs: [],
  }
  rawData.data.forEach((data) => {
    if (mergeResults === undefined) {
      mergeResults = {
        reportType: "suiteReport",
        suiteName: data.suites,
        userFileName:data.userFileName,
        stats: {...stats_data},
        runs: {},
        developer: "https://github.com/sarfrajadstreaks",
        copyright: new Date().getFullYear(),
      };
    }
    reference = mergeResults;
    updateStats(reference.stats,data,true)
    let tempRef;
    if (reference.runs[data.stats.envs[2]] === undefined) {
      reference.runs[data.stats.envs[2]] = {}; //linux
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"] = {}; //default
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]] = {}; //chrome
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]] = {}; //chrome_100_9
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"]={...stats_data}
      updateStats(reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"],data)
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"]=data.scenarios
    } else if (reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"] === undefined) {
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"] = {}; //default
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]] = {}; //chrome
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]] = {}; //chrome_100_9
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"]={...stats_data}
      updateStats(reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"],data)
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"]=data.scenarios
    } else if (reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]] === undefined) {
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]] = {};
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]] = {}; //chrome_100_9
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"]={...stats_data}
      updateStats(reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"],data)
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"]=data.scenarios
    } else if (reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]] == undefined) {
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]] = {}; //chrome_100_9
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"]={...stats_data}
      updateStats(reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"],data)
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"]=data.scenarios
    }else{
      updateStats(reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["stats"],data)
      reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"]=reference.runs[data.stats.envs[2]][data.stats.envs[3] !== undefined ? data.stats.envs[3] : "default"][data.stats.envs[0]][data.stats.envs[1]]["scenarios"].concat(data.scenarios);
    }
  });
  return { mergeResults, fileNames };
}

function writeFile(dir, mergedResults) {
  let filePath = "";
  var timeStamp = new Date()
    .toLocaleString()
    .replace(/\/|:/g, "-")
    .replace(", ", "_");
  mergedResults.mergeResults.stats.timeStamp = timeStamp;
  filePath = path.join(
    dir,
    "runReport_"  + timeStamp + ".json"
  );
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
    console.error(error);
  }
}
module.exports = mergeResults;
