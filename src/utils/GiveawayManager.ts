import type Client from '../../main';
import { MessageEmbed, Guild, Collection, GuildMember, ColorResolvable } from 'discord.js';
import { IGiveaway } from './schemas/Giveaway.model';
import ms from 'ms';
import { IEntry } from './schemas/Entries.model';
import { IGuild } from './schemas/Guild.model';

class GiveawayManager {
    private _client: typeof Client;

    constructor(client: typeof Client) {
        this._client = client;
    }

    async buildEmbed(giveaway: IGiveaway) {
        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);

        const guildConfig: IGuild = await this._client.faster.getGuildConfig(guild.id);
        const lang: any = this._client.faster.lang(guildConfig.lang);
        return new MessageEmbed()
        .setTitle(giveaway.prize)
        .setColor(<ColorResolvable>giveaway.color ?? guild.me.displayHexColor)
        .setImage(giveaway.banner ?? '')
        // @ts-ignore;
        .setDescription(`${lang.embeds.giveaway.running.description.replace('{ms}', Math.floor((ms(giveaway.end)) / 1000)).replace('{ms2}', Math.floor((ms(giveaway.end)) / 1000)).replace('{winners}', giveaway.winners).replace('{host}', guild.members.cache.get(giveaway.author))}${giveaway.conditions.get('roles').toLowerCase() !== 'no' || giveaway.conditions.get('messages').toLowerCase() !== 'no' ? lang.embeds.giveaway.running.conditions.title : ''}${giveaway.conditions.get('roles').toLowerCase() === 'no' ? '' : `${lang.embeds.giveaway.running.conditions.roles.replace('{roles}', giveaway.conditions.get('roles').trim().split(';').map(r => { return `${guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}` }).join(', '))}`}${giveaway.conditions.get('messages').toLowerCase() === 'no' ? '' : `${lang.embeds.giveaway.running.conditions.messages.replace('{messages}', giveaway.conditions.get('messages').trim().trim().split(';').map(m => { return `<:space:920395429361889361>${guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n'))}`}\n\n${giveaway.conditions.get('entries').toLowerCase() != 'no' ? `${lang.embeds.giveaway.running.conditions.entries.replace('{entries}', giveaway.conditions.get('entries') != 'no' ? giveaway.conditions.get('entries').trim().split(';').map(m => { return `<:white_arrow:920396866175262780> ${guild.roles.cache.get(m.split(':')[0].replace('<', '').replace('@', '').replace('&', '').replace('>', '').trim())}: ${m.split(':')[1]} entries` }).join(',\n') : '')}` : ''}`)
        .setFooter({ text: lang.embeds.giveaway.running.footer })
        .setTimestamp();
    }

    async pickWinner(giveaway: IGiveaway, entries: IEntry[], guild: Guild, now: number): Promise<Array<GuildMember> | undefined> {
        return new Promise<Array<GuildMember> | undefined>(async(resolve, reject) => {

            const reactions: Array<string> = new Array<string>();
            const members: Collection<string, GuildMember> = await guild.members.fetch();
            entries.forEach(async (entry: IEntry, index: number) => {
                reactions.push(entry.id)

                if(index === entries.length - 1) {
                    console.log(reactions.length)
                    if(now > reactions.length) now = reactions.length;
                    const potentials: Array<GuildMember> = new Array<GuildMember>();
                    const winners: Array<GuildMember> = new Array<GuildMember>();

                    let index: number = 0;
                    if(reactions.length < 1) resolve(undefined);
                    reactions.forEach(async (user: string) => {
                        const member: GuildMember = members.get(user);
                        if(member && (member.user.bot === false) && potentials.indexOf(member) === -1) potentials.push(member);

                        index++;
                        if(index == reactions.length) {
                            for(let i = 0; i<now;i++) {
                                const winner: GuildMember = potentials[Math.floor(Math.random() * potentials.length)];
                                if(winners.indexOf(winner) == -1) winners.push(winner);
                                else i--;
                                
                                if(i + 1 == now) {
                                    setTimeout(() => {
                                        resolve(winners);  
                                    }, 200)
                                }
                            }
                        }
                    })
                }
            })
        })
    }

    async buildEndEmbed(giveaway: IGiveaway, winners: Array<GuildMember> | undefined) {
        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);
        const author: GuildMember = await guild.members.fetch(giveaway.author);

        const guildConfig: IGuild = await this._client.faster.getGuildConfig(guild.id);
        const lang: any = this._client.faster.lang(guildConfig.lang);
        return new MessageEmbed()
        .setTitle(giveaway.prize)
        .setColor(<ColorResolvable>giveaway.color ?? guild.me.displayHexColor)
        .setImage(giveaway.banner ?? '')
        .setDescription(`${lang.embeds.giveaway.ended.winners.replace('{winners}', winners ? winners.join(', ') : 'Oops, no winners can be determinated :-/')}\n${lang.embeds.giveaway.ended.author.replace('{author}', author)}`)
    }

    getRandomItem(array: Array<unknown>) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

export default GiveawayManager;