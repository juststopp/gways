import type Client from '../../main';
import { Guild, Channel, Message, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { IGiveaway, GiveawayModel } from './schemas/Giveaway.model';
import { EntryModel, IEntry } from './schemas/Entries.model';
import { GuildModel, IGuild } from './schemas/Guild.model';
import { IUser, UserModel } from '../utils/schemas/User.model';

class TimersManager {
    private _client: typeof Client;

    constructor(client: typeof Client) {
        this._client = client;
    }

    ending() {
        // @ts-ignore;
        return setInterval(() => {
            GiveawayModel.find({ ended: false }).then(giveaways => {
                giveaways.forEach(async(giveaway: IGiveaway) => {
                    if((Number(giveaway.end) - Date.now() <= 0) && (giveaway.ended === false)) {
                        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);
                        if(guild) {
                            const channel: Channel | undefined = guild.channels.cache.get(giveaway.channel);
                            if(channel) {
                                const g: IGuild = await GuildModel.findOne({ id: guild.id });
                                const lang: any = this._client.faster.lang(g.lang);

                                const authorMember: GuildMember = await guild.members.fetch(giveaway.author);
                                const authorDatas: IUser = await UserModel.findOne({ id: authorMember.id }).then(u => u || UserModel.create({ id: authorMember.id }));

                                const message: void | Message = await (<TextChannel>channel).messages.fetch(giveaway.id).catch(err => { console.log(err); });
                                if(message) {
                                    const entries: IEntry[] = await EntryModel.find({ giveaway_id: message.id }).then(e => e);
                                    const winners: Array<GuildMember> | undefined = await this._client.giveaways.pickWinner(giveaway, entries, guild, giveaway.winners);
                                    const embed: MessageEmbed = await this._client.giveaways.buildEndEmbed(giveaway, winners);
                                    message.edit({ content: ':tada: **GIVEAWAY ENDED** :tada:', embeds: [embed] });

                                    if(winners?.length > 0) (<TextChannel>channel).send({ content: lang.congratsnew.replace('{winners}', winners.join(', ')).replace('{s}', winners.length > 1 ? 's' : '').replace('{prize}', giveaway.prize) });
                                    else (<TextChannel>channel).send({ content: lang.nowinners })

                                    giveaway.set('ended', true);
                                    giveaway.save();

                                    (<TextChannel>guild.channels.cache.get(g.log))?.send({ content: lang.logs.ended.replace('{prize}', giveaway.prize).replace('{channel}', channel).replace('{giveawayURL}', `https://discord.com/channels/${guild.id}/${giveaway.channel}/${giveaway.id}`)});
                                    if(authorDatas.notifs == 'on') authorMember.send({ content: lang.notifs.ended.replace('{prize}', giveaway.prize).replace('{guild}', guild.name).replace('{giveawayURL}', `https://discord.com/channels/${guild.id}/${giveaway.channel}/${giveaway.id}`)})
                                
                                    winners.forEach(async (u: GuildMember) => {
                                        const userDatas: IUser = await UserModel.findOne({ id: u.id }).then(u => u || UserModel.create({ id: u.id }));
                                        if(userDatas.notifs == 'on') u.send({ content: lang.notifs.win.replace('{prize}', giveaway.prize).replace('{guild}', guild.name).replace('{giveawayURL}', `https://discord.com/channels/${guild.id}/${giveaway.channel}/${giveaway.id}`) })
                                    })
                                } else {
                                    giveaway.set('ended', true)
                                    giveaway.save();
                                }
                            } else {
                                giveaway.set('ended', true)
                                giveaway.save();
                            }
                        } else {
                            giveaway.set('ended', true)
                            giveaway.save();
                        }
                    }
                })
            })
        }, 5000)
    }
}

export default TimersManager;