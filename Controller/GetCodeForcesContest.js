const axios = require("axios");
const { formatDateFromSeconds } = require("./GetFormatTime");

const url = "https://codeforces.com/api/contest.list";

async function getCodeForcesContests() {
  try {
    const { data } = await axios.get(url);

    const futureContest = data.result.filter(
      (contest) => contest.phase === "BEFORE"
    );

    const processedContests = futureContest.map((contest) => {
      const name = contest.name;
      const url = `https://codeforces.com/contest/${contest.id}`;
      const startTime = formatDateFromSeconds(contest.startTimeSeconds);

      const duration = `${contest.durationSeconds / 60} minutes`;
      return { platform: "Codeforces", name, url, startTime, duration };
    });

    return processedContests;
  } catch (error) {
    console.error("Error fetching contests:", error);
  }
}

module.exports = getCodeForcesContests;
