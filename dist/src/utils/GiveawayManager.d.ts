import type Client from '../../main';
import { MessageEmbed, Guild, GuildMember } from 'discord.js';
import { IGiveaway } from './schemas/Giveaway.model';
import { IEntry } from './schemas/Entries.model';
declare class GiveawayManager {
    private _client;
    constructor(client: typeof Client);
    buildEmbed(giveaway: IGiveaway, allGuilds: Map<string, Guild> | string): MessageEmbed;
    pickWinner(giveaway: IGiveaway, entries: IEntry[], guild: Guild): Promise<Array<GuildMember> | undefined>;
    buildEndEmbed(giveaway: IGiveaway, winners: Array<GuildMember> | undefined): Promise<MessageEmbed>;
}
export default GiveawayManager;
