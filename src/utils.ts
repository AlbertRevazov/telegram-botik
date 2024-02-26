import { months } from "./data";
import { IGame } from "./types";
import { Context } from "grammy";

import fetch from "node-fetch";

export const formatedDate = (date: string | undefined) => {
  const month: string | undefined = date?.split("-")[1];
  return date
    ?.split("-")
    .map((elem, index) => {
      if (index !== 1) return elem;
      return months[`${month}`];
    })
    ?.reverse()
    .join(" ");
};

export const formatedTime = (time: string | undefined) => {
  return time
    ?.split(":")
    .map((val, ind) => {
      if (ind === 0) return Number(val) + 3;
      return val;
    })
    .join(":");
};
interface iDayOfMatchProps {
  game: IGame | undefined;
  today: string;
}

export const RemindersGame = async (
  { game, today }: iDayOfMatchProps,
  ctx: Context
) => {
  job = scheduleJob("*/1 * * * *", async () => {
    try {
      const matchDay = game?.utcDate?.toString().split("T")[0];

      if (!game?.matchday) {
        const options = {
          headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
        };
        await fetch(
          `https://api.football-data.org/v4/teams/109/matches?dateFrom=${today}&dateTo=2024-09-29&?limit=1`,
          options
        )
          .then((response) => response.json())
          .then((response) => (game = response?.matches[0]));
      }

      if (matchDay !== today) {
        return ctx.reply(`Сегодня день Игры`);
      } else {
        console.log("nope");
        return ctx.reply("Еще одинь день без футбола");
      }
    } catch (error) {
      console.log(error);
      return "Что то пошло не так ... Повторите попытку позже";
    }
  });
};

import { Job, scheduleJob } from "node-schedule";

let job: Job;

export const startWatchingCurrency = (ctx: Context) => {
  job = scheduleJob("*/5 * * * * *", async () => {});
};
