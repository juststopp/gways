import { MessageReaction, User, Emoji, TextChannel } from "discord.js";
import type Client from "../../main";
import DiscordEvent from "../utils/DiscordEvent";
import { EntryModel } from '../utils/schemas/Entries.model';
import { IGuild, GuildModel } from '../utils/schemas/Guild.model';
import { IGiveaway, GiveawayModel } from '../utils/schemas/Giveaway.model';
import { IUser, UserModel } from '../utils/schemas/User.model';

class MessageReactionRemove extends DiscordEvent {
    _client: typeof Client;
    constructor(client: typeof Client) {
        super(client, "messageReactionRemove");
        this._client = client;
    }

    async run(reaction: MessageReaction, user: User) {
        if(user.bot) return;
        if(reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return;
            }
        }

        const guildConfig: IGuild = await GuildModel.findOne({ id: reaction.message.guild.id }).then(g => g || GuildModel.create({ id: reaction.message.guild.id }));
        const u: IUser = await UserModel.findOne({ id: user.id }).then(u => u || UserModel.create({ id: user.id }));
        const lang: any = this._client.faster.lang(guildConfig.lang);
        let emote: any = await reaction.message.guild.emojis.cache.get(guildConfig.emote);
        if((guildConfig.premium - Date.now()) < 0) emote = "🎉";

        let emoteName: string;
        if(!reaction.message.reactions.cache.get(emote?.id)) emoteName = "🎉";
        else emoteName = emote.name;
        
        switch(reaction.emoji.name) {
            case emoteName: {
                const giveaway: IGiveaway = await GiveawayModel.findOne({ id: reaction.message.id });
                if(!giveaway) return;

                await EntryModel.deleteOne({ giveaway_id: reaction.message.id, id: user.id });
                if(!this._client.reactionsCooldown.some(_ => u.id === user.id)) {
                    (<TextChannel>reaction.message.guild.channels.cache.get(guildConfig.log))?.send({ content: lang.logs.left.replace('{member}', user.tag).replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${giveaway.channel}/${giveaway.id}`)});
                    if(u.notifs == 'on') user.send({ content: lang.notifs.left.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name) }).catch(err => { undefined })
                }
                delete this._client.reactionsCooldown[<any>user.id];
                break;
            }
            default: break;
        }
    }
}

module.exports = MessageReactionRemove;