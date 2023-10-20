import { commands } from "./data";
import { IGame, IHead2Head, IScorer, ISquad, IStandings } from "./types";
import { Bot, webhookCallback } from "grammy";
import express from "express";
import fetch from "node-fetch";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
// Suggest commands in the menu
bot.api.setMyCommands(commands);

// global variable for the request head2head
let headId: number | undefined;

// Handle the /start command to greet the user
bot.command("start", (ctx) => {
  const name = ctx.from?.first_name;
  ctx.reply(`Здраствуйте ${name} 🫡, это Бот с календарем игр Ювентуса на сезон 2022/2023
  \nHello ${name} 🫡, this is a Bot with the Juventus games calendar for the 2022/2023 season`);
});

bot.command("nextgame", async (ctx) => {
  try {
    let game: IGame | undefined;

    if (!game?.matchday) {
      const today = new Date().toISOString().split("T")[0];
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch(
        `https://api.football-data.org/v4/teams/109/matches?dateFrom=${today}&dateTo=2024-09-29&?limit=1`,
        options
      )
        .then((response) => response.json())
        .then((response) => (game = response.matches[0]));
    }

    headId = game?.id;

    const away = game?.awayTeam;
    const home = game?.homeTeam;
    const message = `${game?.competition.name} - ${game?.matchday} тур\n${
      // we get the date in the format we need yyyy-mm-dd
      game?.utcDate.toString().split("T")[0]
      // and get the time in the format hh:mm
    } --- ${game?.utcDate.toString().split("T")[1].substring(0, 5)}\n${
      home?.name
    } - ${
      away?.name
    }\n\nОтправьте /head2head что бы посмотреть историю противостояния этих команд`;

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("previousgame", async (ctx) => {
  try {
    let game: IGame | undefined;

    if (!game?.matchday) {
      const today = new Date().toISOString().split("T")[0];
      const options = {
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
    }

    if (game?.id) {
      const { away, home } = game?.score.fullTime;
      const { matchday, awayTeam, competition, homeTeam, utcDate } = game;

      const message = `${competition.name} - ${matchday} тур\n${
        utcDate.toString().split("T")[0]
      }\n${homeTeam.name} ${home} - ${away} ${awayTeam.name}`;

      return ctx.reply(message);
    }
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("scorers", async (ctx) => {
  try {
    let player: IScorer[] = [];

    if (!player.length) {
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch(
        "https://api.football-data.org/v4/competitions/SA/scorers?limit=10",
        options
      )
        .then((response) => response.json())
        .then((response) => (player = response.scorers));
    }

    const message = player?.reduce((acc, scorer) => {
      return (
        acc +
        `${scorer.player.name} ${scorer.goals} - ${scorer.assists || 0} (${
          scorer.team.shortName
        })\n`
      );
    }, "");

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("standings", async (ctx) => {
  try {
    let table: IStandings[] = [];

    if (!table.length) {
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch(
        "https://api.football-data.org/v4/competitions/SA/standings",
        options
      )
        .then((response) => response.json())
        .then((response) => (table = response.standings[0].table));
    }

    const message = table?.reduce(
      (acc, team) =>
        acc + `${team.position} ${team.team.name} - ${team.points} points\n`,
      ""
    );

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("squad", async (ctx) => {
  try {
    let squad: ISquad[] = [];
    let message = "";

    if (!squad.length) {
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch("https://api.football-data.org/v4/teams/109", options)
        .then((response) => response.json())
        .then((response) => (squad = response.squad));
    }

    for (let i = 0; i < squad.length; i++) {
      // console.log(squad[i].position);

      if (squad[i]?.position !== squad[i - 1]?.position) {
        message += `\n<u>${squad[i].position}</u>\n`;
      }
      message += `${squad[i].name}\n`;
    }
    // console.log(message);

    return ctx.reply(message, { parse_mode: "HTML" });
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

const defaultReply = async (ctx: any) => {
  if (ctx.message.text === "/head2head") {
    let head: IHead2Head | undefined;

    if (headId) {
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch(
        `https://api.football-data.org/v4/matches/${headId}/head2head`,
        options
      )
        .then((response) => response.json())
        .then((response) => (head = response));
    }

    if (head) {
      const { homeTeam, awayTeam, numberOfMatches } = head?.aggregates;
      const home = `${homeTeam.name} wins - ${homeTeam.wins} draws - ${homeTeam.draws} losses - ${homeTeam.losses}`;
      const awai = `${awayTeam.name} wins - ${awayTeam.wins} draws - ${awayTeam.draws} losses - ${awayTeam.losses}`;
      const message = `Последние ${numberOfMatches} матчей с участием этих команд:\n ${home}\n${awai}`;

      return await ctx.reply(message);
    } else {
      return ctx.reply("Для начала нужно узнать с кем игра..");
    }
  }
  await ctx.reply(`Очень интересно... 🤔, ничего не понял `);
  await ctx.replyWithPhoto(
    "https://assets-cms.thescore.com/uploads/image/file/473233/w1280xh966_GettyImages-1235259897.jpg?ts=1632233179"
  );
};

bot.on("message", defaultReply);

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
