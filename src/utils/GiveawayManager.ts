import type Client from '../../main';
import { MessageEmbed, Guild, User, Message, Collection, GuildMember, Channel } from 'discord.js';
import { IGiveaway } from './schemas/Giveaway.model';
import ms from 'ms';
import { EntryModel, IEntry } from './schemas/Entries.model';

class GiveawayManager {
    private _client: typeof Client;

    constructor(client: typeof Client) {
        this._client = client;
    }

    buildEmbed(giveaway: IGiveaway, allGuilds: Map<string, Guild> | string): MessageEmbed {
        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);
        return new MessageEmbed()
        .setTitle(giveaway.prize)
        .setColor(guild.me.displayHexColor)
        // @ts-ignore;
        .setDescription(`\nEnding: <t:${Math.floor((ms(giveaway.end)) / 1000)}:R> (<t:${Math.floor((ms(giveaway.end)) / 1000)}:F>)\nWinner(s): **${giveaway.winners}**\nHosted by: ${guild.members.cache.get(giveaway.author)}\n\n${giveaway.conditions.get('guilds') !== 'no' && giveaway.conditions.get('roles') !== 'no' && giveaway.conditions.get('messages') !== 'no' ? `Requirements:\n` : ''}${giveaway.conditions.get('guilds') === 'no' ? '' : `➜ Server(s) to join: ${giveaway.conditions.get('guilds').trim().split(';').map(g => { return `[${allGuilds.get(g.trim()).name}](${g.trim()})` })}`}\n${giveaway.conditions.get('roles') === 'no' ? '' : `➜ Role(s) to have: ${giveaway.conditions.get('roles').trim().split(';').map(r => { return `${guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}` }).join(', ')}`}\n${giveaway.conditions.get('messages') === 'no' ? '' : `➜ Messages to send:\n${giveaway.conditions.get('messages').trim().trim().split(';').map(m => { return `> ➜ ${guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n')}`}`)
        .setImage(guild.bannerURL({ format: 'png' }))
        .setFooter('By reacting to this message you agree to being DMed.')
        .setTimestamp();
    }

    async pickWinner(giveaway: IGiveaway, entries: IEntry[], guild: Guild): Promise<Array<GuildMember> | undefined> {
        return new Promise<Array<GuildMember> | undefined>(async(resolve, reject) => {

            const reactions: Collection<string, IEntry> = new Collection<string, IEntry>();
            await entries.map(entry => reactions.set(entry.id, entry));
            const potentials: Collection<string, GuildMember> = new Collection<string, GuildMember>();

            let index: number = 0;
            if(reactions.size < 1) resolve(undefined);
            reactions.forEach(async (user: IEntry) => {
                const member: GuildMember = await guild.members.fetch(user.id);
                if(member && (member.user.bot === false)) potentials.set(member.id, member);

                index++;
                if(index == reactions.size) {
                    setTimeout(() => {
                        const winners: Array<GuildMember> =  potentials.random(giveaway.winners);
                        resolve(winners);  
                    }, 200)
                }
            })
        })
    }

    async buildEndEmbed(giveaway: IGiveaway, winners: Array<GuildMember> | undefined): Promise<MessageEmbed> {
        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);
        const author: GuildMember = await guild.members.fetch(giveaway.author);
        return new MessageEmbed()
        .setTitle(giveaway.prize)
        .setColor(guild.me.displayHexColor)
        .setDescription(`Winner(s): ${winners ? winners.join(', ') : 'Oops, no winners can be determinated :-/'}\nHosted by: ${author}`)
    }
}

export default GiveawayManager;