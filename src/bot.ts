import { RemindersGame, formatedDate, formatedTime } from "./utils";
import { commands } from "./data";
import { IGame, IHead2Head, IScorer, ISquad, IStandings } from "./types";
import { Bot, Context, NextFunction, webhookCallback } from "grammy";
import express from "express";
import fetch from "node-fetch";
import schedule from "node-schedule";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
// Suggest commands in the menu
bot.api.setMyCommands(commands);

// global variable for the request head2head
let game: IGame | undefined;
let headId: number | undefined;
let previousId: number | undefined;

const today = new Date().toISOString().split("T")[0];
// Handle the /start command to greet the user 00 00 12 * * 0-6

bot.command("start", (ctx) => {
  const name = ctx.from?.first_name;

  ctx.reply(`Здраствуйте ${name} 🫡, это Бот с календарем игр Ювентуса
  \nHello ${name} 🫡, this is a Bot with the Juventus games calendar`);
});

bot.command("reminders", async (ctx) => {
  return RemindersGame(
    {
      game,
      today: today || new Date().toISOString().split("T")[0],
    },
    ctx
  );
});

bot.command("nextgame", async (ctx) => {
  try {
    if (!game?.matchday) {
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

    previousId =
      game?.awayTeam.name !== "Juventus FC"
        ? game?.awayTeam.id
        : game?.homeTeam.id;

    const away = game?.awayTeam;
    const home = game?.homeTeam;
    const date = game?.utcDate.toString().split("T")[0];
    const time = game?.utcDate.toString().split("T")[1].substring(0, 5);

    const message = `${game?.competition.name} - ${
      game?.matchday
    } тур\n\n${formatedDate(date)} --- ${formatedTime(time)}\n${home?.name} - ${
      away?.name
    }\n\nОтправьте /head2head что бы посмотреть историю противостояния этих команд \n\nОтправьте /previous что бы посмотреть как сыграла команда противника`;

    return ctx.reply(message);
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

bot.command("previousgame", async (ctx) => {
  try {
    let game: IGame | undefined;

    if (!game?.matchday) {
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

      const message = `${competition.name} - ${matchday} тур\n${formatedDate(
        utcDate.toString().split("T")[0]
      )}\n${homeTeam.name} ${home} - ${away} ${awayTeam.name}`;

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
        acc +
        `${team.team.tla} - ${team.points} pts ${team.playedGames} games\n`,
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
      if (squad[i]?.position !== squad[i - 1]?.position) {
        message += `\n<u>${squad[i].position}</u>\n`;
      }
      message += `${squad[i].name}\n`;
    }

    return ctx.reply(message, { parse_mode: "HTML" });
  } catch (error) {
    ctx.reply(`Что то пошло не так, повторите попытку позже`);
  }
});

const defaultReply = async (ctx: Context, next: NextFunction) => {
  if (ctx.message?.text === "/head2head") {
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
      const juve = homeTeam.name === "Juventus FC" ? homeTeam : awayTeam;
      const anotherTeam = homeTeam.name !== "Juventus FC" ? homeTeam : awayTeam;

      const result = `В последних ${numberOfMatches} матчах у Юве против ${anotherTeam.name} \n${juve.wins} побед ${juve.draws} ничей ${juve.losses} поражений `;
      return await ctx.reply(result);
    } else {
      return ctx.reply("Для начала нужно узнать с кем игра..");
    }
  }
  if (ctx.message?.text === "/previous") {
    let previous: IGame | undefined;

    if (previousId) {
      const options = {
        headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
      };

      await fetch(
        `https://api.football-data.org/v4/teams/${previousId}/matches?dateFrom=2023-08-29&?&dateTo=${today}&?limit=1`,

        options
      )
        .then((response) => response.json())
        .then(
          (response) =>
            (previous = response.matches[response.matches.length - 1])
        );
    }

    if (previous?.matchday) {
      const { away, home } = previous?.score?.fullTime;
      const { matchday, awayTeam, competition, homeTeam, utcDate } = previous;

      const message = `${competition.name} - ${matchday} тур\n${formatedDate(
        utcDate.toString().split("T")[0]
      )}\n${homeTeam.name} ${home} - ${away} ${awayTeam.name}`;

      return ctx.reply(message);
    } else {
      return ctx.reply("Для начала нужно узнать с кем игра..");
    }
  }
  await ctx.reply(`Очень интересно... 🤔, ничего не понял `);
  await ctx.replyWithPhoto(
    "https://assets-cms.thescore.com/uploads/image/file/473233/w1280xh966_GettyImages-1235259897.jpg?ts=1632233179"
  );
  return next();
};

bot.on("message", defaultReply, (ctx: Context) => {});

if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  // bot.command("reminders", (ctx) => {
  //   return RemindersGame(
  //     {
  //       game,
  //       today: today || new Date().toISOString().split("T")[0],
  //     },
  //     ctx
  //   );
  // });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
