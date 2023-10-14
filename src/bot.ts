import { IGame, IScorer } from "./types";
import { Bot, webhookCallback } from "grammy";
import express from "express";
import fetch from "node-fetch";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /start command to greet the user
bot.command("start", (ctx) => {
  ctx.reply(`Здраствуйте ${ctx.from?.first_name} 🫡, это Бот с календарем игр Ювентуса на сезон 2022/2023
  \nHello ${ctx.from?.first_name} 🫡, this is a Bot with the Juventus games calendar for the 2022/2023 season`);
});

bot.command("nextgame", async (ctx) => {
  try {
    let game: IGame | undefined;
    const today = new Date().toISOString().split("T")[0];
    const options = {
      method: "GET",
      headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
    };

    await fetch(
      `https://api.football-data.org/v4/teams/109/matches?dateFrom=${today}&dateTo=2024-09-29&?limit=1`,
      options
    )
      .then((response) => response.json())
      .then((response) => (game = response.matches[0]));

    const message = `${game?.competition.name} - ${game?.matchday} тур\n${
      game?.utcDate.toString().split("T")[0]
    } --- ${game?.utcDate.toString().split("T")[1].substring(0, 5)}\n${
      game?.homeTeam.name
    } - ${game?.awayTeam.name}`;

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("previousgame", async (ctx) => {
  try {
    let game: IGame | undefined;
    const today = new Date().toISOString().split("T")[0];
    const options = {
      method: "GET",
      headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
    };

    await fetch(
      `https://api.football-data.org/v4/teams/109/matches?dateFrom=2023-08-29&?${today}&dateTo=${today}&?limit=1`,
      options
    )
      .then((response) => response.json())
      .then(
        (response) => (game = response.matches[response.matches.length - 1])
      );

    const message = `${game?.competition.name} - ${game?.matchday} тур\n${
      game?.utcDate.toString().split("T")[0]
    }\n${game?.homeTeam.name} ${game?.score.fullTime.home} - ${
      game?.score.fullTime.away
    } ${game?.awayTeam.name}`;

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("scorers", async (ctx) => {
  try {
    let game: IScorer[] | undefined;
    let message = "";
    const options = {
      method: "GET",
      headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
    };

    await fetch(
      `https://api.football-data.org/v4/competitions/SA/scorers?limit=10`,
      options
    )
      .then((response) => response.json())
      .then((response) => (game = response.scorers));

    game?.map(
      (scorer) =>
        (message += `${scorer.player.name} ${scorer.goals} - ${
          scorer.assists || 0
        } (${scorer.team.shortName})\n`)
    );
    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

const replyWithIntro = (ctx: any) => {
  ctx.replyWithPhoto(
    "https://assets-cms.thescore.com/uploads/image/file/473233/w1280xh966_GettyImages-1235259897.jpg?ts=1632233179"
  );
  ctx.reply(`Очень интересно... 🤔, ничего не понял `);
};

bot.on("message", replyWithIntro);

// Suggest commands in the menu
bot.api.setMyCommands([
  {
    command: "nextgame",
    description: "Скажет с кем следующая игра",
  },
  {
    command: "previousgame",
    description: "Скажет как закончилась предыдущая",
  },
  { command: "scorers", description: "Список бомбардиров Серии А" },
]);

if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
