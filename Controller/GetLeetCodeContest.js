const axios = require("axios");
const { formatDateFromSeconds } = require("./GetFormatTime");

const url =
  "https://leetcode.com/graphql?query={%20allContests%20{%20title%20titleSlug%20startTime%20duration%20__typename%20}%20}";

async function getLeetCodeContest() {
  try {
    const { data } = await axios.get(url);
    const futureContest = data.data.allContests.filter(
      (e) => e.startTime + e.duration > Math.floor(Date.now() / 1000)
    );
    const processContest = futureContest.map((contest) => {
      const name = contest.title;
      const url = `https://leetcode.com/contest/${contest.titleSlug}`;
      const startTime = formatDateFromSeconds(contest.startTime);
      const duration = 90 + " minutes";
      return { platform: "Leetcode", name, url, startTime, duration };
    });
    return processContest;
  } catch (e) {
    console.log(e);
  }
}

module.exports = getLeetCodeContest;
