import { CommandInteraction, CommandInteractionOptionResolver, Guild, ShardClientUtil, TextChannel, NewsChannel, ThreadChannel, User, GuildMember, InteractionReplyOptions, MessagePayload, InteractionDeferReplyOptions, WebhookEditMessageOptions, ContextMenuInteraction } from "discord.js";
import Client from "../../main";
declare class Context {
    interaction: CommandInteraction | ContextMenuInteraction;
    client: typeof Client;
    args: CommandInteractionOptionResolver;
    datas: any;
    lang: JSON;
    constructor(client: typeof Client, interaction: CommandInteraction | ContextMenuInteraction, guildDatas: any);
    get shards(): ShardClientUtil;
    get guild(): Guild;
    get channel(): TextChannel | NewsChannel | ThreadChannel;
    get author(): User;
    get member(): GuildMember | any;
    get me(): GuildMember;
    reply(content: string | MessagePayload | InteractionReplyOptions): Promise<void>;
    deferReply(options?: InteractionDeferReplyOptions): void;
    followUp(content: string | MessagePayload | InteractionReplyOptions): Promise<import("discord.js").Message | import("discord-api-types").APIMessage>;
    editReply(content: string | MessagePayload | WebhookEditMessageOptions): Promise<import("discord.js").Message | import("discord-api-types").APIMessage>;
    deleteReply(): Promise<void>;
}
export default Context;
