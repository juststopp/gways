import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Guild, MessageEmbed, Permissions, Message, MessageActionRow, MessageSelectMenu, InteractionCollector, SelectMenuInteraction, Collection } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import ms from 'ms';

class EditCmd extends Command {
    constructor() {
        super({
            name: "edit",
            category: "giveaways",
            type: "CHAT_INPUT",
            description: "Edit a giveaway",
            options: [
                {
                    type: "STRING",
                    name: "giveaway_id",
                    description: "The ID of the giveaway message",
                    required: true
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
        })
    }

    async run(ctx: Context) {

        // @ts-ignore;
        const ID: string = ctx.interaction?.targetId || ctx.args.getString('giveaway_id');
        // @ts-ignore;
        let giveaway: IGiveaway[] = await GiveawayModel.find({ id: ID, channel: ctx.channel.id, guild: ctx.guild.id }).then(g => g);

        if(!giveaway[0]) return ctx.reply({ content: "This message is not a giveaway embed from the bot." });        
        if(giveaway[0].ended) return ctx.reply({ content: "You can't edit a giveaway that has allready been ended." });

        ctx.reply({ content: "Let's edit this giveaway. First of all, here is a summary of the giveaway. If you wan't to edit something, select it in the select menu. Don't forget to save when you're done!", ephemeral: true })

        let allGuild: Map<string, Guild> = new Map<string, Guild>();
        ctx.client.faster.checkLinks(giveaway[0].conditions.get('guilds').trim().split(';'), allGuild, true).then(async (allGuilds: Map<string, Guild> | string) => {
            const row: MessageActionRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('edit')
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Select an action')
                .addOptions([
                    {
                        label: "Prize",
                        value: "prize",
                        description: "Edit the prize of the giveaway."
                    }, 
                    {
                        label: "Winners",
                        value: "winners",
                        description: "Change the number of winners."
                    }, 
                    {
                        label: "Duration",
                        value: "duration",
                        description: "Update the duration of the giveaway."
                    }, 
                    {
                        label: "Guilds",
                        value: "guilds",
                        description: "Set new guilds to join. Don't forget to put the servers already configured!"
                    }, 
                    {
                        label: "Roles",
                        value: "roles",
                        description: "Set new roles to have. Don't forget to put the roles already configured!"
                    }, 
                    {
                        label: "Messages",
                        value: "messages",
                        description: "Set new messages to send. Don't forget to put the messages already configured!"
                    }, 
                    {
                        label: "Finish",
                        value: "finish",
                        description: "Stop, save and update all edited values for the giveaway."
                    }
                ])
            )

            const message: Message = await ctx.channel.send({
                embeds: [
                    new MessageEmbed()
                    .setTitle('Summary of the giveaway')
                    .setColor(ctx.guild.me.displayHexColor)
                    // @ts-ignore;
                    .setDescription(`Prize: **${giveaway[0].prize}**\nWinner(s): \`${giveaway[0].winners}\`\nDuration: \`${ms(giveaway[0].end - Date.now())}\` left\nConditions:\n➜ Server(s) to join: ${giveaway[0].conditions.get('guilds') != 'no' ? giveaway[0].conditions.get('guilds').trim().split(';').map(g => { return `[${allGuilds.get(g.trim())?.name}](${g.trim()})` }) : '**None**'}\n➜ Roles to have: ${giveaway[0].conditions.get('roles') != 'no' ? giveaway[0].conditions.get('roles').trim().split(';').map(r => { return `${ctx.guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}` }).join(', ') : '**None**'}\n➜ Messages to send: ${giveaway[0].conditions.get('messages') != 'no' ? `\n` + giveaway[0].conditions.get('messages').trim().split(';').map(m => { return `> ➜ ${ctx.guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n') : '**None**'}`)
                ],
                components: [row]
            })

            const filter = (interaction: SelectMenuInteraction) => interaction.user.id === ctx.author.id;
            const msgfilter = (message: Message) => message.author.id === ctx.author.id && !message.author.bot; 

            const collector: InteractionCollector<SelectMenuInteraction> = message.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 300000 });

            const edited = {
                prize: giveaway[0].prize,
                winners: giveaway[0].winners,
                end: Number(giveaway[0].end),
                conditions: giveaway[0].conditions
            };
            
            collector.on('collect', async (interaction: SelectMenuInteraction) => {
                const value: string = interaction.values[0];
                interaction.reply({ content: `Oh, this is a message to prevent from the interaction to fail. You can dismiss this message \:)`, ephemeral: true })
                switch (value) {
                    case 'prize': {
                        const m = await ctx.channel.send({content: "**What do you wan't the winner(s) to won ?**\n\n- *To stop the giveaway prize edition process, just reply to this message by saying `cancel`.*"});
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel')) {
                                edited.prize = collected.first().content;
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }
                    case 'winners': {
                        const m = await ctx.channel.send({content: "**How many winner(s) do you wan't ?**\n\n- *To stop the giveaway winners edition process, just reply to this message by saying `cancel`.*"});
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel') && Number(collected.first().content)) {
                                edited.winners = Number(collected.first().content);
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }
                    case 'duration': {
                        const m = await ctx.channel.send({content: "**How long do you wan't the giveaway to be ?**\n\n- *To stop the giveaway duration edition process, just reply to this message by saying `cancel`.*"});
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel')) {
                                edited.end = Date.now() + ms(collected.first().content);
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }

                    case 'guilds': {
                        const m = await ctx.channel.send({content: "**Do you wan't users to be on a specific server to enter the giveaway ?**\nNote: All users will be able to participate in the giveaway, they will simply get a message telling them which server(s) to join if there are any.\n\n**YES** - Send an invitation link to the desired server, and specify links with `;` if there are multiple servers to join.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway conditions edition process, just reply to this message by saying `cancel`.*" });
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel')) {
                                const args: Array<string> = collected.first().content.trim().split(';');
                                ctx.client.faster.checkLinks(args, allGuilds, false).then((guilds: Map<string, Guild> | string) => {
                                    allGuilds = guilds;
                                    edited.conditions.set('guilds', collected.first().content);
                                }).catch(err => { console.log(err); });
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }

                    case 'roles': {
                        const m = await ctx.channel.send({content: "**Do you want users to be required to have certain role(s) to participate in the giveaway?**\n\n**YES** - Mention the desired role, and specify roles with `;` if there are multiple roles to have.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway conditions edition process, just reply to this message by saying `cancel`.*" });
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel')) {
                                const args: Array<string> = collected.first().content.trim().split(';');
                                ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                    edited.conditions.set('roles', collected.first().content);
                                }).catch(err => { console.log(err); });
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }

                    case 'messages': {
                        const m = await ctx.channel.send({content: "**Do you want users to be required to send a certain number of messages in the desired channel(s) to participate?**\n\n**YES** - Send the channel spaced with the number of messages to be made by `:`, if there are several channels, separate the different channels by `;`.\n➜ Ex: #general : 50 ; #general-2 : 25\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway conditions edition process, just reply to this message by saying `cancel`.*" });
                        
                        ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                            if(!collected.first().content.trim().includes('cancel')) {
                                const args: Array<string> = collected.first().content.trim().split(';');
                                ctx.client.faster.checkChannels(args, interaction.guild).then(() => {
                                    edited.conditions.set('messages', collected.first().content);
                                }).catch(err => { console.log(err); });
                            }

                            setTimeout(() => {
                                message.edit({
                                    embeds: [this.embed(edited, ctx.guild, allGuilds)],
                                    components: [row]
                                })
    
                                m.delete();
                                collected.first().delete();
                            }, 100)
                        })
                        break;
                    }

                    case 'finish': {
                        const { prize, winners, end, conditions } = edited;

                        giveaway[0].set('prize', prize);
                        giveaway[0].set('winners', winners);
                        giveaway[0].set('end', (end).toString());
                        giveaway[0].set('conditions', conditions);
                        giveaway[0].save();

                        giveaway = await GiveawayModel.find({ id: giveaway[0].id });

                        message.delete();

                        // @ts-ignore;
                        const m: Message = await ctx.guild.channels.cache.get(giveaway[0].channel).messages.fetch(giveaway[0].id);

                        setTimeout(() => {
                            m.edit({
                                content: ":tada: **GIVEAWAY** :tada:",
                                embeds: [ctx.client.giveaways.buildEmbed(giveaway[0], allGuilds)]
                            })
                        }, 100)
                        break;
                    }
                }
            })
        })
    }

    embed(giveaway: any, guild: Guild, allGuilds: Map<string, Guild> | string): MessageEmbed {
        return new MessageEmbed()
        .setTitle('Summary of the giveaway')
        .setColor(guild.me.displayHexColor)
        // @ts-ignore;
        .setDescription(`Prize: **${giveaway.prize}**\nWinner(s): \`${giveaway.winners}\`\nDuration: \`${ms(giveaway.end - Date.now())}\` left\nConditions:\n➜ Server(s) to join: ${giveaway.conditions.get('guilds') != 'no' ? giveaway.conditions.get('guilds').trim().split(';').map(g => { return `[${allGuilds.get(g.trim())?.name}](${g.trim()})` }) : '**None**'}\n➜ Roles to have: ${giveaway.conditions.get('roles') != 'no' ? giveaway.conditions.get('roles').trim().split(';').map(r => { return `${guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}` }).join(', ') : '**None**'}\n➜ Messages to send: ${giveaway.conditions.get('messages') != 'no' ? `\n` + giveaway.conditions.get('messages').trim().split(';').map(m => { return `> ➜ ${guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n') : '**None**'}`)
    }
}

module.exports = new EditCmd();