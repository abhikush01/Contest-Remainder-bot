const axios = require("axios");
const { formatDateTo12Hour } = require("./GetFormatTime");

const url = "https://www.codechef.com/api/list/contests/all";

async function getCodeChefContest() {
  try {
    const { data } = await axios.get(url);
    const futureContest = [
      ...data["future_contests"],
      ...data["present_contests"],
    ];

    const processContest = futureContest.map((contest) => {
      const name = contest.contest_name;
      const url = `https://www.codechef.com/${contest.contest_code}`;
      const startTime = formatDateTo12Hour(contest.contest_start_date);
      const duration = contest.contest_duration + " minutes";
      return { platform: "Codechef", name, url, startTime, duration };
    });
    return processContest;
  } catch (e) {
    console.log(e);
  }
}

module.exports = getCodeChefContest;
