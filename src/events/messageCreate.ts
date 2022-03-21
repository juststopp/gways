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
        GiveawayModel.find({ guild: message.guild.id, ended: false }).then(giveaways => {
            giveaways.forEach(async(giveaway: IGiveaway) => {
                if(message.guild.id !== giveaway.guild) return;
                const messages: Array<string> = giveaway.conditions.get('messages').trim().split(';');
                messages.forEach(async(msg: string) => {
                    if(!msg.trim().split(':')[0].includes(message.channel.id)) return;
                    const datas: IMessages = await MessagesModel.findOne({ id: message.author.id, guild: message.guild.id, channel: message.channel.id }).then(c => c || MessagesModel.create({ id: message.author.id, guild: message.guild.id, channel: message.channel.id }));
                    datas.set('messages', datas.messages + 1);
                    datas.save();
                })
            })
        })
    }
}

module.exports = MessageCreate;