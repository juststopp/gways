import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Guild, MessageEmbed, Permissions, Message, MessageActionRow, MessageSelectMenu, InteractionCollector, SelectMenuInteraction, Collection, ColorResolvable, TextChannel } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import ms from 'ms';
import { GuildModel, IGuild } from '../../utils/schemas/Guild.model';

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
        let giveaway: IGiveaway[] = await GiveawayModel.find({ id: ID, guild: ctx.guild.id }).then(g => g);
        const guild: IGuild = await GuildModel.findOne({ id: ctx.guild.id });

        if(!giveaway[0]) return ctx.reply({ content: ctx.lang.cmds.notagiveawayembed });       
        if(giveaway[0].ended) return ctx.reply({ content: ctx.lang.cmds.ended });

        ctx.reply({ content: ctx.lang.cmds.edit.letsgo });
        ctx.deleteReply();

        const row: MessageActionRow = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId('edit')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder('Select an action')
            .addOptions([
                {
                    label: ctx.lang.cmds.edit.selectMenu.prize.label,
                    value: "prize",
                    description: ctx.lang.cmds.edit.selectMenu.prize.description
                }, 
                {
                    label: ctx.lang.cmds.edit.selectMenu.winners.label,
                    value: "winners",
                    description: ctx.lang.cmds.edit.selectMenu.winners.description
                }, 
                {
                    label: ctx.lang.cmds.edit.selectMenu.duration.label,
                    value: "duration",
                    description: ctx.lang.cmds.edit.selectMenu.duration.description
                },
                {
                    label: ctx.lang.cmds.edit.selectMenu.roles.label,
                    value: "roles",
                    description: ctx.lang.cmds.edit.selectMenu.roles.description
                }, 
                {
                    label: ctx.lang.cmds.edit.selectMenu.messages.label,
                    value: "messages",
                    description: ctx.lang.cmds.edit.selectMenu.messages.description
                }, 
                {
                    label: ctx.lang.cmds.edit.selectMenu.entries.label,
                    value: "entries",
                    description: ctx.lang.cmds.edit.selectMenu.entries.description
                },                 
                {
                    label: ctx.lang.cmds.edit.selectMenu.banner.label,
                    value: "banner",
                    description: ctx.lang.cmds.edit.selectMenu.banner.description
                },                  
                {
                    label: ctx.lang.cmds.edit.selectMenu.color.label,
                    value: "color",
                    description: ctx.lang.cmds.edit.selectMenu.color.description
                },
                {
                    label: ctx.lang.cmds.edit.selectMenu.finish.label,
                    value: "finish",
                    description: ctx.lang.cmds.edit.selectMenu.finish.description
                }
            ])
        )

        const message: Message = await ctx.channel.send({
            embeds: [this.embed(giveaway[0], ctx)],
            components: [row]
        })

        const filter = (interaction: SelectMenuInteraction) => interaction.user.id === ctx.author.id;
        const msgfilter = (message: Message) => message.author.id === ctx.author.id && !message.author.bot; 

        const collector: InteractionCollector<SelectMenuInteraction> = message.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 300000 });

        const edited = {
            prize: giveaway[0].prize,
            winners: giveaway[0].winners,
            end: Number(giveaway[0].end),
            conditions: giveaway[0].conditions,
            banner: giveaway[0].banner,
            color: giveaway[0].color,
        };
        
        collector.on('collect', async (interaction: SelectMenuInteraction) => {
            const value: string = interaction.values[0];
            interaction.reply({ content: 'Editing...' })
            interaction.deleteReply();
            switch (value) {
                case 'prize': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.one });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            edited.prize = collected.first().content;
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }
                case 'winners': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.two });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel') && Number(collected.first().content)) {
                            edited.winners = Number(collected.first().content);
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }
                case 'duration': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.three });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            edited.end = Date.now() + ms(collected.first().content);
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'roles': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.four });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                edited.conditions.set('roles', collected.first().content);
                            }).catch(err => { console.log(err); });
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'messages': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.five });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkChannels(args, interaction.guild).then(() => {
                                edited.conditions.set('messages', collected.first().content);
                            }).catch(err => { console.log(err); });
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'entries': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.six });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                edited.conditions.set('entries', collected.first().content);
                            }).catch(err => { console.log(err); });
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'banner': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.banner });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            const arg: string = collected.first().content;
                            const isURL: Boolean = ctx.client.faster.checkURL(arg)
                            if(isURL) { edited.banner = arg };
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'color': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.start.steps.color });
                    
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(!collected.first().content.trim().includes('cancel')) {
                            const arg: string = collected.first().content;
                            edited.color = arg;
                        }

                        setTimeout(() => {
                            message.edit({
                                embeds: [this.embed(edited, ctx)],
                                components: [row]
                            })

                            m.delete();
                            collected.first().delete().catch();
                        }, 100)
                    })
                    break;
                }

                case 'finish': {
                    const { prize, winners, end, conditions, banner, color } = edited;

                    giveaway[0].set('prize', prize);
                    giveaway[0].set('winners', winners);
                    giveaway[0].set('end', (end).toString());
                    giveaway[0].set('conditions', conditions);
                    giveaway[0].set('banner', banner);
                    giveaway[0].set('color', color);
                    giveaway[0].save();

                    message.delete();

                    const m: Message = await (<TextChannel>ctx.guild.channels.cache.get(giveaway[0].channel)).messages.fetch(giveaway[0].id);

                    setTimeout(async() => {
                        const embed: MessageEmbed = await ctx.client.giveaways.buildEmbed(giveaway[0]);

                        // @ts-ignore;
                        m.edit({
                            content: ctx.lang.running,
                            embeds: [embed]
                        })

                        // @ts-ignore
                        ctx.guild.channels.cache.get(guild.log)?.send({ content: ctx.lang.logs.edited.replace('{member}', ctx.author.tag).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`)});
                    }, 500)
                    break;
                }
            }
        })
    }

    embed(giveaway: any, ctx: Context): MessageEmbed {
        return new MessageEmbed()
        .setTitle(ctx.lang.embeds.summary.title)
        .setColor(<ColorResolvable>giveaway.color ?? ctx.guild.me.displayHexColor)
        .setImage(giveaway.banner ?? '')
        .setDescription(ctx.lang.embeds.summary.description.replace('{prize}', giveaway.prize).replace('{winner}', giveaway.winners).replace('{duration}', ms(giveaway.end - Date.now())).replace('{roles}', giveaway.conditions.get('roles') != 'no' ? giveaway.conditions.get('roles').trim().split(';').map((m: any) => { return `${ctx.guild.roles.cache.get(m.replace('<', '').replace('@', '').replace('&', '').replace('>', '').trim())}` }).join(', ') : 'None').replace('{messages}', giveaway.conditions.get('messages') != 'no' ? giveaway.conditions.get('messages').trim().split(';').map((m: any) => { return `> ➜ ${ctx.guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n') : 'None').replace('{entries}', giveaway.conditions.get('entries') != 'no' ? giveaway.conditions.get('entries').trim().split(';').map((m: any) => { return `> ➜ ${ctx.guild.roles.cache.get(m.split(':')[0].replace('<', '').replace('@', '').replace('&', '').replace('>', '').trim())}: ${m.split(':')[1]} entries` }).join(',\n') : 'None'))
    }
}

module.exports = new EditCmd();