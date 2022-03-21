import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { Permissions, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, InteractionCollector, Message, MessageEmbed, Collection } from 'discord.js';
import { IGuild, GuildModel } from '../../utils/schemas/Guild.model';

class SetupCMD extends Command {
    constructor() {
        super({
            name: "setup",
            category: "utils",
            type: "CHAT_INPUT",
            description: "Setup the guild configurations",
            options: [],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
        });
    }

    async run(ctx: Context) {
        ctx.reply({
            content: ctx.lang.cmds.setup.letsgo,
            ephemeral: true
        })
        const row: MessageActionRow = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId('setup')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(ctx.lang.cmds.setup.rows.main.placeholder)
            .addOptions([
                {
                    label: ctx.lang.cmds.setup.rows.main.options.lang.label,
                    value: "lang",
                    description: ctx.lang.cmds.setup.rows.main.options.lang.description
                },
                {
                    label: ctx.lang.cmds.setup.rows.main.options.bypassroles.label,
                    value: "bypassroles",
                    description: ctx.lang.cmds.setup.rows.main.options.bypassroles.description
                },
                {
                    label: ctx.lang.cmds.setup.rows.main.options.logchannel.label,
                    value: "logchannel",
                    description: ctx.lang.cmds.setup.rows.main.options.logchannel.description
                },
                {
                    label: ctx.lang.cmds.setup.rows.main.options.manager.label,
                    value: "manager",
                    description: ctx.lang.cmds.setup.rows.main.options.manager.description
                },
                {
                    label: ctx.lang.cmds.setup.rows.main.options.blacklist.label,
                    value: "blacklist",
                    description: ctx.lang.cmds.setup.rows.main.options.blacklist.description
                }
            ])
        )

        const guildConfig: IGuild[] = await GuildModel.find({ id: ctx.guild.id }).then(g => g);
        const message: Message = await ctx.channel.send({
            embeds: [this.embed(guildConfig, ctx)],
            components: [row]
        })

        const filter = (interaction: SelectMenuInteraction) => interaction.user.id === ctx.author.id;
        const msgfilter = (message: Message) => message.author.id === ctx.author.id && !message.author.bot;

        const collector: InteractionCollector<SelectMenuInteraction> = message.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 300_000 });
        collector.on('collect', async (interaction: SelectMenuInteraction) => {
            const value: string = interaction.values[0];
            interaction.reply({ content: 'Editing...' });
            interaction.deleteReply();
            switch(value) {
                case 'lang': {
                    const langRow: MessageActionRow = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                        .setCustomId('lang')
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder(ctx.lang.cmds.setup.rows.lang.placeholder)
                        .addOptions([
                            {
                                label: ctx.lang.cmds.setup.rows.lang.options.en.label,
                                value: "en",
                                description: ctx.lang.cmds.setup.rows.lang.options.en.description
                            },
                            {
                                label: ctx.lang.cmds.setup.rows.lang.options.fr.label,
                                value: "fr",
                                description: ctx.lang.cmds.setup.rows.lang.options.fr.description
                            }
                        ])
                    )
                    const m: Message = await ctx.channel.send({
                        content: ctx.lang.cmds.setup.collector.chooseLang,
                        components: [langRow]
                    })

                    m.awaitMessageComponent({ filter, time: 15_000, componentType: "SELECT_MENU" }).then(async(collected: SelectMenuInteraction) => {
                        guildConfig[0].set('lang', collected.values[0])
                        guildConfig[0].save();
                        message.edit({
                            embeds: [this.embed(guildConfig, ctx)],
                            components: [row]
                        })
                        m.delete().catch();
                    })
                    break;
                }
                case 'bypassroles': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.setup.collector.msgCollector.bypass.reply });
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().trim() === "none") {
                            guildConfig[0].set('bypassroles', 'none');
                            guildConfig[0].save();
                            message.edit({
                                embeds: [this.embed(guildConfig, ctx)],
                                components: [row]
                            })
                            m.delete().catch();
                        } else {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                guildConfig[0].set('bypassroles', collected.first().content);

                                guildConfig[0].save();
                                message.edit({
                                    embeds: [this.embed(guildConfig, ctx)],
                                    components: [row]
                                })
                                m.delete().catch();
                            }).catch(err => { ctx.channel.send({ content: err }); });
                        }
                    })
                    break;
                }
                case 'logchannel': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.setup.collector.msgCollector.log.reply });
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().trim() === "none") {
                            guildConfig[0].set('log', 'none');
                            guildConfig[0].save();
                            message.edit({
                                embeds: [this.embed(guildConfig, ctx)],
                                components: [row]
                            })
                            m.delete().catch();
                        } else {
                            const arg: string = collected.first().content;
                            const isChannel: boolean = ctx.client.faster.checkChannel(arg, interaction.guild);
                            if(isChannel) {
                                guildConfig[0].set('log', arg.replace('<', '').replace('#', '').replace('>', ''));
                                guildConfig[0].save();
                                message.edit({
                                    embeds: [this.embed(guildConfig, ctx)],
                                    components: [row]
                                })
                                m.delete().catch();
                            } else {
                                message.channel.send({ content: ctx.lang.faster.nochannel.replace('{arg}', arg.trim().replace('<', '').replace('#', '').replace('>', ''))})
                            }
                        }
                    })
                    break;
                }
                case 'manager': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.setup.collector.msgCollector.manager.reply });
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().trim() === "none") {
                            guildConfig[0].set('managers', 'none');
                            guildConfig[0].save();
                            message.edit({
                                embeds: [this.embed(guildConfig, ctx)],
                                components: [row]
                            })
                            m.delete().catch();
                        } else {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                guildConfig[0].set('managers', collected.first().content);

                                guildConfig[0].save();
                                message.edit({
                                    embeds: [this.embed(guildConfig, ctx)],
                                    components: [row]
                                })
                                m.delete().catch();
                            }).catch(err => { ctx.channel.send({ content: err }); });
                        }
                    })
                    break;
                }
                case 'blacklist': {
                    const m = await ctx.channel.send({content: ctx.lang.cmds.setup.collector.msgCollector.blacklist.reply });
                    ctx.channel.awaitMessages({ filter: msgfilter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().trim() === "none") {
                            guildConfig[0].set('blacklist', 'none');
                            guildConfig[0].save();
                            message.edit({
                                embeds: [this.embed(guildConfig, ctx)],
                                components: [row]
                            })
                            m.delete().catch();
                        } else {
                            const args: Array<string> = collected.first().content.trim().split(';');
                            ctx.client.faster.checkRoles(args, interaction.guild).then(() => {
                                guildConfig[0].set('blacklist', collected.first().content);

                                guildConfig[0].save();
                                message.edit({
                                    embeds: [this.embed(guildConfig, ctx)],
                                    components: [row]
                                })
                                m.delete().catch();
                            }).catch(err => { ctx.channel.send({ content: err }); });
                        }
                    })
                    break;
                }
            }
        })
    }

    embed(guildConfig: IGuild[], ctx: Context): MessageEmbed {
        return new MessageEmbed()
        .setAuthor({ name: ctx.guild.name, iconURL: ctx.guild.iconURL({ dynamic: true }) })
        .setColor(ctx.guild.me.displayHexColor)
        .setDescription(ctx.lang.cmds.setup.embed.description.replace('{lang}', guildConfig[0].lang).replace('{bypassroles}', guildConfig[0].bypassroles == "none" || !guildConfig[0].bypassroles ? ctx.lang.none : guildConfig[0].bypassroles.split(';').map((r: any) => ctx.guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))).join(', ')).replace('{logChannel}', guildConfig[0].log == 'none' || !guildConfig[0].log ? ctx.lang.none : '<#'+guildConfig[0].log+'>').replace('{managerroles}', guildConfig[0].managers == "none" || !guildConfig[0].managers ? ctx.lang.none : guildConfig[0].managers.split(';').map((r: any) => ctx.guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))).join(', ')).replace('{blacklistroles}', guildConfig[0].blacklist == "none" || !guildConfig[0].blacklist ? ctx.lang.none : guildConfig[0].blacklist.split(';').map((r: any) => ctx.guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))).join(', ')))
    }
}

module.exports = new SetupCMD();