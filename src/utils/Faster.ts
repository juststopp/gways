import Client from "../../main";
import { resolve } from 'path';
import { Guild, Channel, Role, GuildMember } from 'discord.js';
import { IMessages, MessagesModel } from '../utils/schemas/Messages.model';
import { IGuild, GuildModel } from '../utils/schemas/Guild.model';

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

    async getGuildConfig(guildId: string) {
        return await GuildModel.findOne({ id: guildId });
    }

    async checkRoles(args: Array<string>, guild: Guild) {
        const guildConfig: IGuild = await this.getGuildConfig(guild.id);
        const lang: any = this.lang(guildConfig.lang);
        return new Promise((resolve, reject) => {

            args.forEach((a: string, index: number) => {
                const arg: string = a.trim().split(':')[0];
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const role: Role = guild.roles.cache.find(r => r.id === arg.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))
                if(!role) reject(lang.faster.norole.replace('{arg}', arg));
                
                if(index === args.length - 1) resolve('Done!');
            })

        })
    }

    async checkChannels(args: Array<string>, guild: Guild) {
        const guildConfig: IGuild = await this.getGuildConfig(guild.id);
        const lang: any = this.lang(guildConfig.lang);
        return new Promise((resolve, reject) => {
            args.forEach((arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const splitted: Array<string> = arg.trim().split(':');
                const channel: Channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                const messages: number = Number(splitted[1]);
                
                if(!channel) reject(lang.faster.nochannel.replace('{arg}', splitted[0].trim().replace('<', '').replace('#', '').replace('>', '')));
                if(!messages) reject(lang.faster.notanumber.replace('{arg}', splitted[1]));
                
                if(index === args.length - 1) resolve('Done!');
            })
        })
    }

    async checkUserRoles(roles: Array<string>, userId: string, guildId: string) {
        const guild: Guild = this.client.guilds.cache.get(guildId);
        if(!guild) resolve('Done!');

        const guildConfig: IGuild = await this.getGuildConfig(guild.id);
        const lang: any = this.lang(guildConfig.lang);
        return new Promise((resolve, reject) => {
            roles.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const member: GuildMember = await guild.members.fetch(userId);
                if(!member) reject(lang.faster.cantcheckroles)
                
                if(!member.roles.cache.has(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))) reject(lang.faster.conditions.musthaverole.replace('{role}', guild.roles.cache.get(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))?.name))
                if(index === roles.length - 1) resolve('Done!');
            });
        })
    }

    async checkBypassUserRoles(roles: Array<string>, userId: string, guildId: string) {
        const guild: Guild = this.client.guilds.cache.get(guildId);
        if(!guild) resolve('Done!');

        const guildConfig: IGuild = await this.getGuildConfig(guild.id);
        const lang: any = this.lang(guildConfig.lang);
        let have = 0;
        return new Promise((resolve, reject) => {
            if(roles.find(r => r.toLowerCase() == 'none')) return reject('No roles');

            roles.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const member: GuildMember = await guild.members.fetch(userId);
                if(!member) reject(lang.faster.cantcheckroles)
                
                if(member.roles.cache.has(arg.trim().toLowerCase().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))) have++;
                if(index === roles.length - 1) {
                    if(have === 0) reject('No bypassroles.')
                    else resolve('Bypass role found!')
                }
            });
        })
    }

    async checkUserMessages(messages: Array<string>, userId: string, guildId: string) {
        const guild: Guild = this.client.guilds.cache.get(guildId);
        if(!guild) resolve('Done!');

        const guildConfig: IGuild = await this.getGuildConfig(guild.id);
        const lang: any = this.lang(guildConfig.lang);
        return new Promise((resolve, reject) => {
            messages.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                const splitted: Array<string> = arg.trim().split(':');
                const channel: Channel = guild.channels.cache.get(splitted[0].trim().replace('<', '').replace('#', '').replace('>', ''));
                if(channel) {
                    const datas: IMessages = await MessagesModel.findOne({ id: userId, guild: guild.id, channel: channel.id }).then(c => c || MessagesModel.create({ id: userId, guild: guild.id, channel: channel.id, messages: 0 }));
                    if(datas.messages < Number(splitted[1])) reject(`You must send \`${Number(splitted[1]) - datas.messages}\` more messages in ${channel} to enter into this giveaway.`);
                    if(datas.messages < Number(splitted[1])) reject(lang.faster.conditions.mustsend.replace('{messages}', Number(splitted[1]) - datas.messages).replace('{channel}', channel));
                }

                if(index === messages.length - 1) resolve('Done!');
            })
        })
    }

    getUserEntries(entries: Array<string>, userId: string, guild: Guild): Promise<number> {
        return new Promise<number>((resolve: Function, reject: Function) => {
            let entry: number = 1; 
            entries.forEach(async(arg: string, index: number) => {
                if(arg.toLowerCase() === 'no') resolve(entry);

                const splitted: Array<string> = arg.trim().split(':');

                const role: Role = guild.roles.cache.get(splitted[0].trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''));
                if(!role) return;
                const roleEntries: number = Number(splitted[1]);
                if(!roleEntries) return;

                const member: GuildMember = await guild.members.fetch(userId);
                if(!member) return;

                if(member.roles.cache.has(role.id)) entry+=roleEntries;

                if(index === entries.length - 1) resolve(entry);
            })
        })
    }

    checkChannel(channel: string, guild: Guild): boolean {
        return guild.channels.cache.some(c => c.id === channel.replace('<', '').replace('#', '').replace('>', ''));
    }

    checkURL(url: string) {
        const pattern = new RegExp('^(https?:\\/\\/)?'+
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
            '((\\d{1,3}\\.){3}\\d{1,3}))'+
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
            '(\\?[;&a-z\\d%_.~+=-]*)?'+
            '(\\#[-a-z\\d_]*)?$','i');
        return !!pattern.test(url);
    }
}

export default Faster;