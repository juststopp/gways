import type Client from '../../main';
import { Guild, Channel, Message, GuildMember, MessageEmbed } from 'discord.js';
import { IGiveaway, GiveawayModel } from './schemas/Giveaway.model';
import { EntryModel, IEntry } from './schemas/Entries.model';

class TimersManager {
    private _client: typeof Client;

    constructor(client: typeof Client) {
        this._client = client;
    }

    ending() {
        // @ts-ignore;
        return setInterval(() => {
            GiveawayModel.find({}).then(giveaways => {
                giveaways.forEach(async(giveaway: IGiveaway) => {
                    if((Number(giveaway.end) - Date.now() <= 0) && (giveaway.ended === false)) {
                        const guild: Guild = this._client.guilds.cache.get(giveaway.guild);
                        if(!guild) return;
                        const channel: Channel | undefined = guild.channels.cache.get(giveaway.channel);
                        if(!channel) return giveaway.delete();

                        // @ts-ignore;
                        const message: Message = await channel.messages.fetch(giveaway.id).catch(err => { console.log(err); });
                        if(!message) return giveaway.delete();

                        const entries: IEntry[] = await EntryModel.find({ giveaway_id: message.id }).then(e => e);
                        const winners: Array<GuildMember> | undefined = await this._client.giveaways.pickWinner(giveaway, entries, guild);
                        const embed: MessageEmbed = await this._client.giveaways.buildEndEmbed(giveaway, winners);
                        message.edit({ content: ':tada: **GIVEAWAY ENDED** :tada:', embeds: [embed] });

                        // @ts-ignore;
                        if(winners?.length > 0) channel.send({ content: `:tada: Congratulations ${winners.join(', ')}, you are the winner${winners.length > 1 ? 's' : ''} for **${giveaway.prize}**!` });
                        // @ts-ignore;
                        else channel.send({ content: ":tada: Oops, no winners can be determinated for this giveaway :-/"})

                        giveaway.set('ended', true);
                        giveaway.save();
                    }
                })
            })
        }, 10000)
    }
}

export default TimersManager;