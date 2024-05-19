"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWatchingCurrency = exports.RemindersGame = exports.formatedTime = exports.formatedDate = void 0;
const data_1 = require("./data");
const node_fetch_1 = __importDefault(require("node-fetch"));
const formatedDate = (date) => {
    var _a;
    const month = date === null || date === void 0 ? void 0 : date.split("-")[1];
    return (_a = date === null || date === void 0 ? void 0 : date.split("-").map((elem, index) => {
        if (index !== 1)
            return elem;
        return data_1.months[`${month}`];
    })) === null || _a === void 0 ? void 0 : _a.reverse().join(" ");
};
exports.formatedDate = formatedDate;
const formatedTime = (time) => {
    return time === null || time === void 0 ? void 0 : time.split(":").map((val, ind) => {
        if (ind === 0)
            return Number(val) + 3;
        return val;
    }).join(":");
};
exports.formatedTime = formatedTime;
const RemindersGame = async ({ game, today }, ctx) => {
    job = (0, node_schedule_1.scheduleJob)("*/1 * * * *", async () => {
        var _a;
        try {
            const matchDay = (_a = game === null || game === void 0 ? void 0 : game.utcDate) === null || _a === void 0 ? void 0 : _a.toString().split("T")[0];
            if (!(game === null || game === void 0 ? void 0 : game.matchday)) {
                const options = {
                    headers: { "X-Auth-Token": "1bb65d5d077f4ccba1280a3735cb9242" },
                };
                await (0, node_fetch_1.default)(`https://api.football-data.org/v4/teams/109/matches?dateFrom=${today}&dateTo=2024-09-29&?limit=1`, options)
                    .then((response) => response.json())
                    .then((response) => (game = response === null || response === void 0 ? void 0 : response.matches[0]));
            }
            if (matchDay === today) {
                return ctx.reply(`Сегодня день Игры`);
            }
            else {
                return ctx.reply("Еще одинь день без футбола");
            }
        }
        catch (error) {
            console.log(error);
            return "Что то пошло не так ... Повторите попытку позже";
        }
    });
};
exports.RemindersGame = RemindersGame;
const node_schedule_1 = require("node-schedule");
let job;
const startWatchingCurrency = (ctx) => {
    job = (0, node_schedule_1.scheduleJob)("*/5 * * * * *", async () => { });
};
exports.startWatchingCurrency = startWatchingCurrency;
