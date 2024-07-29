const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const {
  codechefContest,
  codeforcesContest,
  leetcodeContest,
} = require("./Controller/index");

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started at Port ${PORT}`);
});

userSelections = {};
let allContests = [];

async function getAllContest() {
  const codeChefContests = await codechefContest();
  const codeforcesContests = await codeforcesContest();
  const leetCodeContests = await leetcodeContest();

  const contests = [
    ...codeChefContests,
    ...codeforcesContests,
    ...leetCodeContests,
  ];
  return contests;
}

const token = process.env.TOKEN;

function formatContestDetails(contest) {
  const startTime = new Date(contest.startTime);

  const formattedTime = startTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = startTime.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `Platform: ${contest.platform}\nName: ${contest.name}\nURL: ${contest.url}\nBegins at: ${formattedTime} ${formattedDate} (IST)\nDuration: ${contest.duration} \n`;
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  allContests = await getAllContest();
  bot.sendMessage(
    chatId,
    "Welcome to Contest Reminder Bot! Use /help to see available commands."
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Available commands:\n/select - Select contests\n/add - add Contest to recieve remainder\n/list - List selected contests"
  );
});

bot.onText(/\/select/, async (msg) => {
  const chatId = msg.chat.id;

  allContests = await getAllContest();

  const formattedContests = allContests
    .map((contest, index) => `${index + 1}. ${formatContestDetails(contest)}`)
    .join("\n");

  bot.sendMessage(
    chatId,
    "Select contests by replying with /add command and the numbers separated by commas (e.g. /add 1,3,5):\n\n" +
      formattedContests,
    { disable_web_page_preview: true }
  );
});

bot.onText(/\/add(.*)/, (msg, match) => {
  const chatId = msg.chat.id;

  const input = match[1].trim();

  if (input === "") {
    bot.sendMessage(
      chatId,
      "Please specify contest numbers to add. Use /select to view available contests."
    );
    return;
  }

  const contestNumbers = input
    .split(",")
    .map((num) => parseInt(num.trim()) - 1);

  const invalidNumbers = contestNumbers.filter(
    (num) => isNaN(num) || num < 0 || num >= allContests.length
  );

  if (invalidNumbers.length > 0) {
    bot.sendMessage(
      chatId,
      "Invalid contest numbers. Please check the available contests and try again."
    );
    return;
  }

  const selectedContests = contestNumbers
    .map((index) => allContests[index])
    .filter((contest) => contest);

  if (!userSelections[chatId]) {
    userSelections[chatId] = [];
  }

  userSelections[chatId] = userSelections[chatId].concat(selectedContests);

  bot.sendMessage(chatId, "Contests added to your reminder list successfully!");
});

bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;

  if (!userSelections[chatId] || userSelections[chatId].length === 0) {
    bot.sendMessage(chatId, "You have not selected any contests.");
  } else {
    const formattedContests = userSelections[chatId]
      .map((contest, index) => `${index + 1}. ${formatContestDetails(contest)}`)
      .join("\n");
    bot.sendMessage(chatId, "Your selected contests:\n\n" + formattedContests, {
      disable_web_page_preview: true,
    });
  }
});

bot.on("message", (msg) => {
  if (msg.text[0] === "/") return;
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Hello! Use /select to view available contests and /add <contest_numbers> to add contests to your reminder list."
  );
});

async function sendContestReminders() {
  const currentTime = new Date().getTime();

  for (const userId in userSelections) {
    const contests = userSelections[userId];
    for (let i = contests.length - 1; i >= 0; i--) {
      const contest = contests[i];
      if (
        Math.abs(new Date(contest.startTime).getTime() - currentTime) <= 3600000
      ) {
        try {
          await bot.sendMessage(
            userId,
            `Reminder: Contest "${contest.name}" starts in 1 hour!\nPlatform: ${contest.platform}\nLink: ${contest.url}`
          );

          contests.splice(i, 1);

          if (contests.length === 0) {
            delete userSelections[userId];
          }
        } catch (error) {
          console.error("Error sending reminder message:", error);
        }
      }
    }
  }
}

cron.schedule("*/5  * * * *", () => {
  sendContestReminders();
});
