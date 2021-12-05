import type Client from '../../main';
import DiscordEvent from '../utils/DiscordEvent';
import CommandsManager from "../utils/CommandsManager";
import { Message } from 'discord.js';
import { IGiveaway, GiveawayModel } from '../utils/schemas/Giveaway.model';
import { IMessages, MessagesModel } from '../utils/schemas/Messages.model';

class MessageCreate extends DiscordEvent {
    _client: typeof Client;
    constructor(client: typeof Client) {
        super(client, "messageCreate");
        this._client = client;
    }

    async run(message: Message) {
        if(message.author.bot) return;
        GiveawayModel.find({}).then(giveaways => {
            giveaways.forEach(async(giveaway: IGiveaway) => {
                if(giveaway.ended === true) return;
                if(message.guild.id !== giveaway.guild) return;
                if(message.channel.id !== giveaway.channel) return;

                const datas: IMessages = await MessagesModel.findOne({ id: message.author.id, guild: message.guild.id, channel: message.channel.id }).then(c => c || MessagesModel.create({ id: message.author.id, guild: message.guild.id, channel: message.channel.id }));
                datas.set('messages', datas.messages + 1);
                datas.save();
            })
        })
    }
}

module.exports = MessageCreate;