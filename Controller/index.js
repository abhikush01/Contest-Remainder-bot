const getCodeChefContest = require("./GetCodeChefContest");
const getCodeForcesContests = require("./GetCodeForcesContest");
const getLeetCodeContest = require("./GetLeetCodeContest");

async function codechefContest() {
  const data = await getCodeChefContest();
  const res = [];
  res.push(...data);
  return res;
}

async function codeforcesContest() {
  const data = await getCodeForcesContests();
  const res = [];
  res.push(...data);
  return res;
}

async function leetcodeContest() {
  const data = await getLeetCodeContest();
  const res = [];
  res.push(...data);
  return res;
}

module.exports = { codechefContest, codeforcesContest, leetcodeContest };
