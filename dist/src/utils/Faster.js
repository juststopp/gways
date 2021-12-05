"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const Messages_model_1 = require("../utils/schemas/Messages.model");
class Faster {
    constructor(client) {
        this.client = client;
    }
    clean(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof text !== "string")
                text = require("util").inspect(text, { depth: 1 });
            text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replace(this.client.token, "[TOKEN]");
            return text;
        });
    }
    lang(lang) {
        const path = (0, path_1.resolve)(__dirname, "..", "..", "..", "languages");
        const langPath = (0, path_1.resolve)(path, `${lang}.json`);
        return require(langPath);
    }
    checkLinks(args, allGuilds, need) {
        return new Promise((resolve, reject) => {
            args.forEach((arg, index) => {
                if (arg.toLowerCase() === 'no')
                    resolve('Done!');
                axios_1.default.get('https://discord.com/api/v6/invites/' + arg.trim().split('/')[3], {
                    headers: {
                        "User-Agent": "DiscordBot",
                        "Content-Type": "application/json",
                        "Authorization": "Bot " + this.client.config.token
                    }
                }).then((res) => __awaiter(this, void 0, void 0, function* () {
                    // @ts-ignore;
                    const servers = yield this.client.shard.broadcastEval((client, { guildId }) => client.guilds.cache.get(guildId), { context: { guildId: res.data.guild.id } });
                    if (!servers || !servers.find((s) => (s === null || s === void 0 ? void 0 : s.id) === res.data.guild.id))
                        reject(`I'm not in this guild: ${arg}`);
                    // @ts-ignore;
                    if (need)
                        allGuilds.set(arg.trim(), servers.find((s) => (s === null || s === void 0 ? void 0 : s.id) === res.data.guild.id));
                    if (index === args.length - 1) {
                        resolve(allGuilds);
                    }
                })).catch(err => {
                    reject(`This link does not exists: ${arg}`);
                });
            });
        });
    }
    checkRoles(args, guild) {
        return new Promise((resolve, reject) => {
            args.forEach((arg, index) => {
                if (arg.toLowerCase() === 'no')
                    resolve('Done!');
                const role = guild.roles.cache.find(r => r.id === arg.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''));
                if (!role)
                    reject(`There is no role with ID \`${arg}\` in this guild.`);
                if (index === args.length - 1)
                    resolve('Done!');
            });
        });
    }
    checkChannels(args, guild) {
        return new Promise((resolve, reject) => {
            args.forEach((arg, index) => {
                if (arg.toLowerCase() === 'no')
                    resolve('Done!');
                const splitted = arg.trim().split(':');
                const channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                const messages = Number(splitted[1]);
                if (!channel)
                    reject(`There is no channel with ID \`${splitted[0].trim().replace('<', '').replace('#', '').replace('>', '')}\` in this guild.`);
                if (!messages)
                    reject(`\`${splitted[1]}\` can't be set has a number of messages to send.`);
                if (index === args.length - 1)
                    resolve('Done!');
            });
        });
    }
    checkUserGuilds(guilds, userId) {
        return new Promise((resolve, reject) => {
            resolve('Done!');
            /*guilds.forEach((arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!')
                
                axios.get('https://discord.com/api/v6/invites/' + arg.trim().split('/')[3], {
                    headers: {
                        "User-Agent": "DiscordBot",
                        "Content-Type": "application/json",
                        "Authorization": "Bot " + this.client.config.token
                    }
                }).then(async(res) => {
                    // @ts-ignore;
                    const users = await this.client.shard.broadcastEval(async (client: typeof Client, { guildId, userId }) => await client.guilds.cache.get(guildId)?.members.fetch(userId), { context: { guildId: res.data.guild.id, userId: userId } });
                    // @ts-ignore;
                    if(!users || !users.find((u: any) => u?.userId == userId)) reject(`You must join [${res.data.guild.name}](${arg}) before entering this giveaway.`);
                    if(index === guilds.length - 1) {
                        resolve('Done!');
                    }
                }).catch(err => {
                    resolve('The link does no longer exists.')
                })
            })*/
        });
    }
    checkUserRoles(roles, userId, guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild)
            (0, path_1.resolve)('Done!');
        return new Promise((resolve, reject) => {
            roles.forEach((arg, index) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (arg.toLowerCase() === 'no')
                    resolve('Done!');
                const member = yield guild.members.fetch(userId);
                if (!member)
                    reject('We couldn\'t check your roles. Try again later.');
                if (!member.roles.cache.has(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', '')))
                    reject(`You must have the \`${(_a = guild.roles.cache.get(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))) === null || _a === void 0 ? void 0 : _a.name}\` role to enter.`);
                if (index === roles.length - 1)
                    resolve('Done!');
            }));
        });
    }
    checkUserMessages(messages, userId, guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild)
            (0, path_1.resolve)('Done!');
        return new Promise((resolve, reject) => {
            messages.forEach((arg, index) => __awaiter(this, void 0, void 0, function* () {
                if (arg.toLowerCase() === 'no')
                    resolve('Done!');
                const splitted = arg.trim().split(':');
                const channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                if (channel) {
                    const datas = yield Messages_model_1.MessagesModel.findOne({ id: userId, guild: guild.id, channel: channel.id }).then(c => c || Messages_model_1.MessagesModel.create({ id: userId, guild: guild.id, channel: channel.id, messages: 0 }));
                    if (datas.messages < Number(splitted[1]))
                        reject(`You must send \`${Number(splitted[1]) - datas.messages}\` more messages in ${channel} to enter into this giveaway.`);
                }
                if (index === messages.length - 1)
                    resolve('Done!');
            }));
        });
    }
}
exports.default = Faster;
