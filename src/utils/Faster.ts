import Client from "../../main";
import { resolve } from 'path';
import { Guild, Channel, Role, Collection, Snowflake, GuildMember } from 'discord.js';
import axios from 'axios';
import { IMessages, MessagesModel } from '../utils/schemas/Messages.model';

class Faster {
    client: typeof Client;

    constructor(client: typeof Client) {
        this.client = client;
    }

    async clean(text: string) {
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
        text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replace(this.client.token, "[TOKEN]");
        return text;
    }

    lang(lang: string | undefined): JSON {
        const path = resolve(__dirname, "..", "..", "..", "languages");
        const langPath = resolve(path, `${lang}.json`)
        return require(langPath);
    }

    checkLinks(args: Array<string>, allGuilds: Map<string, Guild> | string, need: boolean): Promise<Map<string, Guild> | string> {
        return new Promise<Map<string, Guild> | string>((resolve, reject) => {

            args.forEach((arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');
                
                axios.get('https://discord.com/api/v6/invites/' + arg.trim().split('/')[3], {
                    headers: {
                        "User-Agent": "DiscordBot",
                        "Content-Type": "application/json",
                        "Authorization": "Bot " + this.client.config.token
                    }
                }).then(async(res) => {
                    // @ts-ignore;
                    const servers: Collection<Snowflake, Guild> = await this.client.shard.broadcastEval((client: typeof Client, { guildId }) => client.guilds.cache.get(guildId), { context: { guildId: res.data.guild.id } });
                    if(!servers || !servers.find((s: any) => s?.id === res.data.guild.id)) reject(`I'm not in this guild: ${arg}`);

                    // @ts-ignore;
                    if(need) allGuilds.set(arg.trim(), servers.find((s: any) => s?.id === res.data.guild.id));

                    if(index === args.length - 1) {
                        resolve(allGuilds);
                    }
                }).catch(err => {
                    reject(`This link does not exists: ${arg}`);
                })
            })
        })
    }

    checkRoles(args: Array<string>, guild: Guild) {
        return new Promise((resolve, reject) => {

            args.forEach((arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const role: Role = guild.roles.cache.find(r => r.id === arg.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))
                if(!role) reject(`There is no role with ID \`${arg}\` in this guild.`);
                
                if(index === args.length - 1) resolve('Done!');
            })

        })
    }

    checkChannels(args: Array<string>, guild: Guild) {
        return new Promise((resolve, reject) => {
            args.forEach((arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const splitted: Array<string> = arg.trim().split(':');
                const channel: Channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                const messages: number = Number(splitted[1]);
                
                if(!channel) reject(`There is no channel with ID \`${splitted[0].trim().replace('<', '').replace('#', '').replace('>', '')}\` in this guild.`);
                if(!messages) reject(`\`${splitted[1]}\` can't be set has a number of messages to send.`);
                
                if(index === args.length - 1) resolve('Done!');
            })
        })
    }

    checkUserGuilds(guilds: Array<string>, userId: string) {
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
        })
    }

    checkUserRoles(roles: Array<string>, userId: string, guildId: string) {
        const guild: Guild = this.client.guilds.cache.get(guildId);
        if(!guild) resolve('Done!');
        return new Promise((resolve, reject) => {
            roles.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const member: GuildMember = await guild.members.fetch(userId);
                if(!member) reject('We couldn\'t check your roles. Try again later.')
                
                if(!member.roles.cache.has(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))) reject(`You must have the \`${guild.roles.cache.get(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))?.name}\` role to enter.`)
                if(index === roles.length - 1) resolve('Done!');
            });
        })
    }

    checkUserMessages(messages: Array<string>, userId: string, guildId: string) {
        const guild: Guild = this.client.guilds.cache.get(guildId);
        if(!guild) resolve('Done!');
        return new Promise((resolve, reject) => {
            messages.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const splitted: Array<string> = arg.trim().split(':');
                const channel: Channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                if(channel) {
                    const datas: IMessages = await MessagesModel.findOne({ id: userId, guild: guild.id, channel: channel.id }).then(c => c || MessagesModel.create({ id: userId, guild: guild.id, channel: channel.id, messages: 0 }));
                    if(datas.messages < Number(splitted[1])) reject(`You must send \`${Number(splitted[1]) - datas.messages}\` more messages in ${channel} to enter into this giveaway.`);
                }

                if(index === messages.length - 1) resolve('Done!');
            })
        })
    }
}

export default Faster;