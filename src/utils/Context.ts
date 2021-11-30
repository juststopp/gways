import { CommandInteraction, CommandInteractionOptionResolver, Guild, ShardClientUtil, TextChannel,
    NewsChannel, ThreadChannel, User, GuildMember, InteractionReplyOptions, MessagePayload,
    InteractionDeferReplyOptions, WebhookEditMessageOptions, GuildChannel
} from "discord.js";
import Client from "../../main";

class Context {
    interaction: CommandInteraction;
    client: typeof Client;
    args: CommandInteractionOptionResolver;
    datas: any;
    lang: JSON;

    constructor(client: typeof Client, interaction: CommandInteraction, guildDatas: any) {
        this.interaction = interaction;
        this.client = client;
        this.args = interaction.options;
        this.datas = guildDatas;
        this.lang = this.client.faster.lang(guildDatas.lang);
    }

    get shards(): ShardClientUtil {
        if(!this.client?.shard) throw new Error("Shard introuvable");
        return this.client.shard;
    }

    get guild(): Guild {
        if(!this.interaction.guild) throw new Error("Serveur introuvable");
        return this.interaction.guild;
    }

    get channel(): TextChannel | NewsChannel | ThreadChannel {
        if(!this.interaction.channel || !this.interaction.guild) throw new Error("Salon de serveur introuvable.");
        if(!(this.interaction.channel instanceof GuildChannel) && !(this.interaction.channel instanceof ThreadChannel)) throw new Error("Salon introuvable.");
        return this.interaction.channel;
    }

    get author(): User {
        return this.interaction.user;
    }

    get member(): GuildMember | any {
        return this.interaction.member;
    }

    get me(): GuildMember {
        return this.guild.me;
    }

    reply(content: string | MessagePayload | InteractionReplyOptions) {
        return this.interaction.reply(content);
    }

    deferReply(options?: InteractionDeferReplyOptions) {
        this.interaction.deferReply(options);
    }

    followUp(content: string | MessagePayload | InteractionReplyOptions) {
        return this.interaction.followUp(content);
    }

    editReply(content: string | MessagePayload | WebhookEditMessageOptions) {
        return this.interaction.editReply(content);
    }

    deleteReply(): Promise<void> {
        return this.interaction.deleteReply();
    }
}

export default Context;