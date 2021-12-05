import { MessageReaction, MessageEmbed, User } from "discord.js";
import type Client from "../../main";
import DiscordEvent from "../utils/DiscordEvent";
import { IGiveaway, GiveawayModel } from '../utils/schemas/Giveaway.model';
import { EntryModel, IEntry } from '../utils/schemas/Entries.model';

class MessageReactionAdd extends DiscordEvent {
    constructor(client: typeof Client) {
        super(client, "messageReactionAdd");
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
                const giveaway: IGiveaway = await GiveawayModel.findOne({ id: reaction.message.id });
                if(!giveaway) return;

                const guilds = giveaway.conditions.get('guilds').trim().split(';');
                this._client.faster.checkUserGuilds(guilds, user.id).then(() => {
                    const roles = giveaway.conditions.get('roles').trim().split(';');
                    this._client.faster.checkUserRoles(roles, user.id, reaction.message.guild.id).then(() => {
                        const messages = giveaway.conditions.get('messages').trim().split(';');
                        this._client.faster.checkUserMessages(messages, user.id, reaction.message.guild.id).then(async() => {
                            await EntryModel.create({ giveaway_id: reaction.message.id, id: user.id });

                            // @ts-ignore;
                            user.send({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Success')
                                    .setColor('GREEN')
                                    .setDescription(`You're entry into [this giveaway](https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}) has been approved! **Good luck**`)
                                ]
                            })
                        }).catch((err: string) => {
                            // @ts-ignore;
                            user.send({
                                embeds: [
                                    new MessageEmbed()
                                    .setTitle('Error')
                                    .setColor('RED')
                                    .setDescription(err)
                                ]
                            })
                            reaction.message.reactions.cache.get('🎉').users.remove(user.id);
                        })
                    }).catch((err: string) => {
                        // @ts-ignore;
                        user.send({
                            embeds: [
                                new MessageEmbed()
                                .setTitle('Error')
                                .setColor('RED')
                                .setDescription(err)
                            ]
                        })
                        reaction.message.reactions.cache.get('🎉').users.remove(user.id);
                    })
                }).catch((err: string) => {
                    // @ts-ignore;
                    user.send({
                        embeds: [
                            new MessageEmbed()
                            .setTitle('Error')
                            .setColor('RED')
                            .setDescription(err)
                        ]
                    })
                    reaction.message.reactions.cache.get('🎉').users.remove(user.id);
                })
                break;
            }
            default: {
                break;
            }
        }
    }
}

module.exports = MessageReactionAdd;