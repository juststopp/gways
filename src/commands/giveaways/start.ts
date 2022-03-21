import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { Permissions, Message, CollectorFilter, Collection, MessageEmbed, Guild, Emoji, TextChannel } from 'discord.js';
import ms from 'ms';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { IGuild, GuildModel } from '../../utils/schemas/Guild.model';

class GiveawayStart extends Command {
    constructor() {
        super({
            name: "start",
            category: "giveaways",
            description: "Start the configuration of a giveaway.",
            examples: ["start"],
            type: "CHAT_INPUT",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            botPerms: [Permissions.FLAGS.ADD_REACTIONS]
        })
    }

    async run(ctx: Context) {
        const guildConfig: IGuild = await GuildModel.findOne({ id: ctx.guild.id }).then(g => g || GuildModel.create({ id: ctx.guild.id }));
        const giveaways: IGiveaway[] = await GiveawayModel.find({ guild: ctx.guild.id, ended: false });
        if(((giveaways.length + 1) > 4) && ((guildConfig.premium - Date.now()) < 0)) return ctx.reply({ content: ctx.lang.cmds.start.max, ephemeral: true })
        ctx.reply({content: ctx.lang.cmds.start.reply })
        
        const filter: CollectorFilter<[Message]> = (message: Message) => message.author.id === ctx.author.id && !message.author.bot; 
        
        ctx.channel.send({content: ctx.lang.cmds.start.steps.one });
        ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
            if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
            const prize: string = collected.first().content;

            ctx.channel.send({content: ctx.lang.cmds.start.steps.two });
            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                const winners: number = Number(collected.first().content);
                if(!winners) return ctx.channel.send({ content: ctx.lang.notanumber });

                ctx.channel.send({content: ctx.lang.cmds.start.steps.three });
                ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                    if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                    const duration: number = ms(collected.first().content);
                    if(duration - Date.now() > 1000 * 60 * 24 * ((guildConfig.premium - Date.now()) > 0 ? 31 : 14)) return ctx.channel.send({ content: ctx.lang.cmds.start.maxduration.replace('{max}', ((guildConfig.premium - Date.now()) > 0 ? "31" : "14")) })

                    const conditions = new Map<string, string>();

                    ctx.channel.send({ content: ctx.lang.cmds.start.steps.four });
                    ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                        conditions.set('roles', collected.first().content);
                        const roles: Array<string> = conditions.get('roles').trim().split(';');

                        ctx.client.faster.checkRoles(roles, ctx.guild).then(() => {

                            ctx.channel.send({ content: ctx.lang.cmds.start.steps.five });
                            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                                conditions.set('messages', collected.first().content);
                                const messages: Array<string> = conditions.get('messages').trim().split(';');
        
                                ctx.client.faster.checkChannels(messages, ctx.guild).then(() => {

                                    ctx.channel.send({ content: ctx.lang.cmds.start.steps.six })
                                    ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                        if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                                        conditions.set('entries', collected.first().content);
                                        const entries: Array<string> = conditions.get('entries').trim().split(';');

                                        ctx.client.faster.checkRoles(entries, ctx.guild).then(() => {
                                            
                                            ctx.channel.send({
                                                embeds: [
                                                    new MessageEmbed()
                                                    .setTitle(ctx.lang.embeds.summary.title)
                                                    .setColor(ctx.guild.me.displayHexColor)
                                                    .setDescription(ctx.lang.embeds.summary.description.replace('{prize}', prize).replace('{winner}', winners).replace('{duration}', ms(duration)).replace('{roles}', conditions.get('roles') != 'no' ? conditions.get('roles').trim().split(';').map(m => { return `${ctx.guild.roles.cache.get(m.replace('<', '').replace('@', '').replace('&', '').replace('>', '').trim())}` }).join(', ') : 'None').replace('{messages}', conditions.get('messages') != 'no' ? conditions.get('messages').trim().split(';').map(m => { return `> ➜ ${ctx.guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n') : 'None').replace('{entries}', conditions.get('entries') != 'no' ? conditions.get('entries').trim().split(';').map(m => { return `> ➜ ${ctx.guild.roles.cache.get(m.split(':')[0].replace('<', '').replace('@', '').replace('&', '').replace('>', '').trim())}: ${m.split(':')[1]} entries` }).join(',\n') : 'None'))
                                                ]
                                            })

                                            ctx.channel.send({ content: ctx.lang.cmds.start.steps.seven })
                                            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped})
                                                
                                                const channel = collected.first().mentions.channels.first() || ctx.guild.channels.cache.get(collected.first().content.trim().split(' ')[0]);
                                                if(!channel || channel.type !== 'GUILD_TEXT') return ctx.reply({ content: ctx.lang.notatextchannel });

                                                // @ts-ignore;
                                                const message: Message = await channel.send({ content: ctx.lang.cmds.start.starting });
                                                const giveaway: IGiveaway = await GiveawayModel.create({
                                                    id: message.id,
                                                    author: ctx.author.id,
                                                    channel: channel.id,
                                                    guild: ctx.guild.id,
                                                    prize,
                                                    winners,
                                                    conditions,
                                                    end: (Date.now() + duration).toString(),
                                                    ended: false
                                                })
                                                const embed: MessageEmbed = await ctx.client.giveaways.buildEmbed(giveaway)
                                                await message.edit({ content: ctx.lang.running, embeds: [embed] })
                                                const emote: Emoji = await ctx.guild.emojis.cache.get(guildConfig.emote);

                                                let emoteName: string = "🎉";
                                                if((guildConfig.premium - Date.now()) > 0) emoteName = emote?.id || "🎉";

                                                await message.react(emoteName);
                                                ctx.channel.send({ content: ctx.lang.cmds.start.started });

                                                (<TextChannel>ctx.guild.channels.cache.get(guildConfig.log))?.send({ content: ctx.lang.logs.launched.replace('{member}', ctx.author).replace('{prize}', giveaway.prize).replace('{channel}', channel).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway.channel}/${giveaway.id}`)});
                                            })
                                        }).catch(err => {
                                            console.log(err);
                                            ctx.channel.send({ content: err })
                                        })
                                    }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }));
                                    
                                }).catch(err => {
                                    console.log(err);
                                    ctx.channel.send({ content: err })
                                })
                            }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }));
                        }).catch(err => {
                            console.log(err);
                            ctx.channel.send({ content: err })
                        })
                    }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }));
                }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }));

            }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }));

        }).catch((err: any) => ctx.channel.send({ content: ctx.lang.start.steps.timeout }))
    }
}

module.exports = new GiveawayStart();