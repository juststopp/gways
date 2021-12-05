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
const discord_js_1 = require("discord.js");
const ms_1 = __importDefault(require("ms"));
class GiveawayManager {
    constructor(client) {
        this._client = client;
    }
    buildEmbed(giveaway, allGuilds) {
        const guild = this._client.guilds.cache.get(giveaway.guild);
        return new discord_js_1.MessageEmbed()
            .setTitle(giveaway.prize)
            .setColor(guild.me.displayHexColor)
            // @ts-ignore;
            .setDescription(`\nEnding: <t:${Math.floor(((0, ms_1.default)(giveaway.end)) / 1000)}:R> (<t:${Math.floor(((0, ms_1.default)(giveaway.end)) / 1000)}:F>)\nWinner(s): **${giveaway.winners}**\nHosted by: ${guild.members.cache.get(giveaway.author)}\n\n${giveaway.conditions.get('guilds') !== 'no' && giveaway.conditions.get('roles') !== 'no' && giveaway.conditions.get('messages') !== 'no' ? `Requirements:\n` : ''}${giveaway.conditions.get('guilds') === 'no' ? '' : `➜ Server(s) to join: ${giveaway.conditions.get('guilds').trim().split(';').map(g => { return `[${allGuilds.get(g.trim()).name}](${g.trim()})`; })}`}\n${giveaway.conditions.get('roles') === 'no' ? '' : `➜ Role(s) to have: ${giveaway.conditions.get('roles').trim().split(';').map(r => { return `${guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}`; }).join(', ')}`}\n${giveaway.conditions.get('messages') === 'no' ? '' : `➜ Messages to send:\n${giveaway.conditions.get('messages').trim().trim().split(';').map(m => { return `> ➜ ${guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages`; }).join(',\n')}`}`)
            .setImage(guild.bannerURL({ format: 'png' }))
            .setFooter('By reacting to this message you agree to being DMed.')
            .setTimestamp();
    }
    pickWinner(giveaway, entries, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const reactions = new discord_js_1.Collection();
                yield entries.map(entry => reactions.set(entry.id, entry));
                const potentials = new discord_js_1.Collection();
                let index = 0;
                if (reactions.size < 1)
                    resolve(undefined);
                reactions.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                    const member = yield guild.members.fetch(user.id);
                    if (member && (member.user.bot === false))
                        potentials.set(member.id, member);
                    index++;
                    if (index == reactions.size) {
                        setTimeout(() => {
                            const winners = potentials.random(giveaway.winners);
                            resolve(winners);
                        }, 200);
                    }
                }));
            }));
        });
    }
    buildEndEmbed(giveaway, winners) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = this._client.guilds.cache.get(giveaway.guild);
            const author = yield guild.members.fetch(giveaway.author);
            return new discord_js_1.MessageEmbed()
                .setTitle(giveaway.prize)
                .setColor(guild.me.displayHexColor)
                .setDescription(`Winner(s): ${winners ? winners.join(', ') : 'Oops, no winners can be determinated :-/'}\nHosted by: ${author}`);
        });
    }
}
exports.default = GiveawayManager;
