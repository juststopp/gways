import { MessageReaction, User } from "discord.js";
import type Client from "../../main";
import DiscordEvent from "../utils/DiscordEvent";
import { EntryModel } from '../utils/schemas/Entries.model';

class MessageReactionRemove extends DiscordEvent {
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
        
        switch(reaction.emoji.name) {
            case '🎉': {
                await EntryModel.deleteOne({ giveaway_id: reaction.message.id, id: user.id });
            }
            default: break;
        }
    }
}

module.exports = MessageReactionRemove;