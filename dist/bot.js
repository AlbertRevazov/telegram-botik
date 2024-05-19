"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const data_1 = require("./data");
const grammy_1 = require("grammy");
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Create a bot using the Telegram token
const bot = new grammy_1.Bot(process.env.TELEGRAM_TOKEN || '');
// Suggest commands in the menu
bot.api.setMyCommands(data_1.commands);
// global variable for the request head2head
let game;
let headId;
let previousId;
const today = new Date().toISOString().split('T')[0];
// Handle the /start command to greet the user 00 00 12 * * 0-6
bot.command('start', ctx => {
    var _a, _b, _c;
    const name = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name;
    if (((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.username) === 'Azamat_dzagoi') {
        ctx.reply(`Салам Гады, Манан ус най, манан похуй у, доместоса хугаева 10 или 12`);
    }
    if (((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username) === 'MaratEsiev') {
        ctx.reply(`Салам кинконганенок шыта факусыс?, индонезия китай`);
    }
    ctx.reply(`  
  Hello ${name} 🫡, this is a Bot with the Juventus games calendar

Games
 /previousgame - show the previous game
 /nextgame - show the next game

Standings
 /standings - show the standings Serie A
 /scorers - show the standings scorers Serie A
 
Squad 
 /squad - show the team composition

* data taken from API football-data.org and are not always relevant
`);
});
bot.command('nextgame', async (ctx) => {
    try {
        if (!(game === null || game === void 0 ? void 0 : game.matchday)) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)(`https://api.football-data.org/v4/teams/109/matches?dateFrom=${today}&dateTo=2024-09-29&?limit=1`, options)
                .then(response => response.json())
                .then(response => (game = response.matches[0]));
        }
        headId = game === null || game === void 0 ? void 0 : game.id;
        previousId =
            (game === null || game === void 0 ? void 0 : game.awayTeam.name) !== 'Juventus FC'
                ? game === null || game === void 0 ? void 0 : game.awayTeam.id
                : game === null || game === void 0 ? void 0 : game.homeTeam.id;
        const away = game === null || game === void 0 ? void 0 : game.awayTeam;
        const home = game === null || game === void 0 ? void 0 : game.homeTeam;
        const date = game === null || game === void 0 ? void 0 : game.utcDate.toString().split('T')[0];
        const time = game === null || game === void 0 ? void 0 : game.utcDate.toString().split('T')[1].substring(0, 5);
        const message = `${game === null || game === void 0 ? void 0 : game.competition.name} - ${game === null || game === void 0 ? void 0 : game.matchday} тур\n\n${(0, utils_1.formatedDate)(date)} --- ${(0, utils_1.formatedTime)(time)}\n${home === null || home === void 0 ? void 0 : home.name} - ${away === null || away === void 0 ? void 0 : away.name}\n\nОтправьте /head2head что бы посмотреть историю противостояния этих команд \n\nОтправьте /previous что бы посмотреть как сыграла команда противника`;
        return ctx.reply(message);
    }
    catch (error) {
        ctx.reply(`Что то пошло не так, повторите попытку позже`);
    }
});
bot.command('previousgame', async (ctx) => {
    try {
        let game;
        if (!(game === null || game === void 0 ? void 0 : game.matchday)) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)(`https://api.football-data.org/v4/teams/109/matches?dateFrom=2023-08-29&?${today}&dateTo=${today}&?limit=1`, options)
                .then(response => response.json())
                .then(response => (game = response.matches[response.matches.length - 1]));
        }
        if (game === null || game === void 0 ? void 0 : game.id) {
            const { away, home } = game === null || game === void 0 ? void 0 : game.score.fullTime;
            const { matchday, awayTeam, competition, homeTeam, utcDate } = game;
            const message = `${competition.name} - ${matchday} тур\n${(0, utils_1.formatedDate)(utcDate.toString().split('T')[0])}\n${homeTeam.name} ${home} - ${away} ${awayTeam.name}`;
            return ctx.reply(message);
        }
    }
    catch (error) {
        ctx.reply(`Что то пошло не так, повторите попытку позже`);
    }
});
bot.command('scorers', async (ctx) => {
    try {
        let player = [];
        if (!player.length) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)('https://api.football-data.org/v4/competitions/SA/scorers?limit=10', options)
                .then(response => response.json())
                .then(response => (player = response.scorers));
        }
        const message = player === null || player === void 0 ? void 0 : player.reduce((acc, scorer) => {
            return (acc +
                `${scorer.player.name} ${scorer.goals} - ${scorer.assists || 0} (${scorer.team.shortName})\n`);
        }, '');
        return ctx.reply(message);
    }
    catch (error) {
        ctx.reply(`Что то пошло не так, повторите попытку позже`);
    }
});
bot.command('standings', async (ctx) => {
    try {
        let table = [];
        if (!table.length) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)('https://api.football-data.org/v4/competitions/SA/standings', options)
                .then(response => response.json())
                .then(response => (table = response.standings[0].table));
        }
        const message = table === null || table === void 0 ? void 0 : table.reduce((acc, team) => acc +
            `${team.team.tla} - ${team.points} pts ${team.playedGames} games\n`, '');
        return ctx.reply(message);
    }
    catch (error) {
        ctx.reply(`Что то пошло не так, повторите попытку позже`);
    }
});
bot.command('squad', async (ctx) => {
    var _a, _b;
    try {
        let squad = [];
        let message = '';
        if (!squad.length) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)('https://api.football-data.org/v4/teams/109', options)
                .then(response => response.json())
                .then(response => (squad = response.squad));
        }
        for (let i = 0; i < squad.length; i++) {
            if (((_a = squad[i]) === null || _a === void 0 ? void 0 : _a.position) !== ((_b = squad[i - 1]) === null || _b === void 0 ? void 0 : _b.position)) {
                message += `\n<u>${squad[i].position}</u>\n`;
            }
            message += `${squad[i].name}\n`;
        }
        return ctx.reply(message, { parse_mode: 'HTML' });
    }
    catch (error) {
        ctx.reply(`Что то пошло не так, повторите попытку позже`);
    }
});
const defaultReply = async (ctx, next) => {
    var _a, _b, _c;
    if (((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) === '/head2head') {
        let head;
        if (headId) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)(`https://api.football-data.org/v4/matches/${headId}/head2head`, options)
                .then(response => response.json())
                .then(response => (head = response));
        }
        if (head) {
            const { homeTeam, awayTeam, numberOfMatches } = head === null || head === void 0 ? void 0 : head.aggregates;
            const juve = homeTeam.name === 'Juventus FC' ? homeTeam : awayTeam;
            const anotherTeam = homeTeam.name !== 'Juventus FC' ? homeTeam : awayTeam;
            const result = `В последних ${numberOfMatches} матчах у Юве против ${anotherTeam.name} \n${juve.wins} побед ${juve.draws} ничей ${juve.losses} поражений `;
            return await ctx.reply(result);
        }
        else {
            return ctx.reply('Для начала нужно узнать с кем игра..');
        }
    }
    if (((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text) === '/previous') {
        let previous;
        if (previousId) {
            const options = {
                headers: { 'X-Auth-Token': '1bb65d5d077f4ccba1280a3735cb9242' },
            };
            await (0, node_fetch_1.default)(`https://api.football-data.org/v4/teams/${previousId}/matches?dateFrom=2023-08-29&?&dateTo=${today}&?limit=1`, options)
                .then(response => response.json())
                .then(response => (previous = response.matches[response.matches.length - 1]));
        }
        if (previous === null || previous === void 0 ? void 0 : previous.matchday) {
            const { away, home } = (_c = previous === null || previous === void 0 ? void 0 : previous.score) === null || _c === void 0 ? void 0 : _c.fullTime;
            const { matchday, awayTeam, competition, homeTeam, utcDate } = previous;
            const message = `${competition.name} - ${matchday} тур\n${(0, utils_1.formatedDate)(utcDate.toString().split('T')[0])}\n${homeTeam.name} ${home} - ${away} ${awayTeam.name}`;
            return ctx.reply(message);
        }
        else {
            return ctx.reply('Для начала нужно узнать с кем игра..');
        }
    }
    await ctx.reply(`Очень интересно... 🤔, ничего не понял `);
    await ctx.replyWithPhoto('https://assets-cms.thescore.com/uploads/image/file/473233/w1280xh966_GettyImages-1235259897.jpg?ts=1632233179');
    return next();
};
bot.on('message', defaultReply, (ctx) => { });
if (process.env.NODE_ENV === 'production') {
    // Use Webhooks for the production server
    const app = (0, express_2.default)();
    const router = (0, express_1.Router)();
    app.use(express_2.default.json());
    app.use((0, grammy_1.webhookCallback)(bot, 'express'));
    router.use('/reminders', (req, res) => {
        try {
            bot.on('message', (ctx) => {
                console.log();
                return (0, utils_1.RemindersGame)({
                    game,
                    today: today || new Date().toISOString().split('T')[0],
                }, ctx);
            });
            bot.drop;
        }
        catch (error) {
            console.log(error);
        }
    });
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Bot listening on port ${PORT}`);
    });
}
else {
    // Use Long Polling for development
    bot.start();
}
