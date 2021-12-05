import Client from "../../main";
import { Guild } from 'discord.js';
declare class Faster {
    client: typeof Client;
    constructor(client: typeof Client);
    clean(text: string): Promise<string>;
    lang(lang: string | undefined): JSON;
    checkLinks(args: Array<string>, allGuilds: Map<string, Guild> | string, need: boolean): Promise<Map<string, Guild> | string>;
    checkRoles(args: Array<string>, guild: Guild): Promise<unknown>;
    checkChannels(args: Array<string>, guild: Guild): Promise<unknown>;
    checkUserGuilds(guilds: Array<string>, userId: string): Promise<unknown>;
    checkUserRoles(roles: Array<string>, userId: string, guildId: string): Promise<unknown>;
    checkUserMessages(messages: Array<string>, userId: string, guildId: string): Promise<unknown>;
}
export default Faster;
