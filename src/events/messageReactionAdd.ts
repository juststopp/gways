import { MessageReaction, MessageEmbed, User, Emoji, TextChannel } from "discord.js";
import type Client from "../../main";
import DiscordEvent from "../utils/DiscordEvent";
import { IGiveaway, GiveawayModel } from '../utils/schemas/Giveaway.model';
import { EntryModel } from '../utils/schemas/Entries.model';
import { IGuild, GuildModel } from '../utils/schemas/Guild.model';
import { IUser, UserModel } from '../utils/schemas/User.model';

class MessageReactionAdd extends DiscordEvent {
    _client: typeof Client
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

        const guildConfig: IGuild = await GuildModel.findOne({ id: reaction.message.guild.id }).then(g => g || GuildModel.create({ id: reaction.message.guild.id }));
        const u: IUser = await UserModel.findOne({ id: user.id }).then(u => u || UserModel.create({ id: user.id }));
        const lang: any = this._client.faster.lang(guildConfig.lang);
        let emote: any = await reaction.message.guild.emojis.cache.get(guildConfig.emote);
        if((guildConfig.premium - Date.now()) < 0) emote = "🎉";

        let emoteName: string;
        if(!reaction.message.reactions.resolve(emote?.id)) emoteName = "🎉";
        else emoteName = emote.name;
        
        switch(reaction.emoji.name) {
            case emoteName: {
                const giveaway: IGiveaway = await GiveawayModel.findOne({ id: reaction.message.id });
                if(!giveaway) return;

                const blacklist: Array<string> = guildConfig.blacklist.trim().split(';');
                this._client.faster.checkBypassUserRoles(blacklist, user.id, reaction.message.guild.id).then(() => {
                    this._client.reactionsCooldown.push(user.id);
                    reaction.message.reactions.resolve(emote?.id || '🎉').users.remove(user.id);

                    if(u.notifs === 'on') user.send({ content: lang.notifs.blacklist.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name) });
                }).catch(() => {
                    const bypassroles: Array<string> = guildConfig.bypassroles.trim().split(';');
                    this._client.faster.checkBypassUserRoles(bypassroles, user.id, reaction.message.guild.id).then(() => {
                        const entries: Array<string> = giveaway.conditions.get('entries').trim().split(';');
                        this._client.faster.getUserEntries(entries, user.id, reaction.message.guild).then(async (entry: number) => {
                            await EntryModel.create({ giveaway_id: reaction.message.id, id: user.id, entries: entry });
                            (<TextChannel>reaction.message.guild.channels.cache.get(guildConfig.log))?.send({ content: lang.logs.bypass.replace('{member}', user.tag).replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${giveaway.channel}/${giveaway.id}`)});
                            
                            if(u.notifs === 'on') user.send({ content: lang.notifs.joined.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{entries}', entry).replace('{s}', entry > 1 ? 's' : '').replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name)}).catch(err => { undefined })
                        })
                    }).catch(() => {
                        const roles: Array<string> = giveaway.conditions.get('roles').trim().split(';');
                        this._client.faster.checkUserRoles(roles, user.id, reaction.message.guild.id).then(() => {
                            const messages: Array<string> = giveaway.conditions.get('messages').trim().split(';');
                            this._client.faster.checkUserMessages(messages, user.id, reaction.message.guild.id).then(() => {
                                const entries: Array<string> = giveaway.conditions.get('entries').trim().split(';');
                                this._client.faster.getUserEntries(entries, user.id, reaction.message.guild).then(async (entry: number) => {
                                    await EntryModel.create({ giveaway_id: reaction.message.id, id: user.id, entries: entry });
                                    (<TextChannel>reaction.message.guild.channels.cache.get(guildConfig.log))?.send({ content: lang.logs.joined.replace('{member}', user.tag).replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${giveaway.channel}/${giveaway.id}`)});

                                    if(u.notifs === 'on') user.send({ content: lang.notifs.joined.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{entries}', entry).replace('{s}', entry > 1 ? 's' : '').replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name)}).catch(err => { undefined })
                                })
                            }).catch((err: string) => {
                                this._client.reactionsCooldown.push(user.id);
                                reaction.message.reactions.resolve(emote?.id || '🎉').users.remove(user.id);
                                if(u.notifs === 'on') user.send({ content: lang.notifs.denied.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name).replace('{err}', err)}).catch(err => { undefined })
                            })
                        }).catch((err: string) => {
                            this._client.reactionsCooldown.push(user.id);
                            reaction.message.reactions.resolve(emote?.id || '🎉').users.remove(user.id);
                            if(u.notifs === 'on') user.send({ content: lang.notifs.denied.replace('{giveawayURL}', `https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`).replace('{prize}', giveaway.prize).replace('{guild}', reaction.message.guild.name).replace('{err}', err)}).catch(err => { undefined })
                        })
                    })
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