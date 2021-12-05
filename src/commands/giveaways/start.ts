import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { Permissions, Message, CollectorFilter, Collection, MessageEmbed, Guild } from 'discord.js';
import ms from 'ms';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';

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
        ctx.reply({content: "Let's create a new giveaway on this server!\n\nIn the next steps, you will have to complete some informations about the giveaway to start it. If you wan't to leave the giveaway creation process, reply to the messages below by saying `cancel`."})
        
        const filter: CollectorFilter<[Message]> = (message: Message) => message.author.id === ctx.author.id && !message.author.bot; 
        
        ctx.channel.send({content: "**What do you wan't the winner(s) to won ?** - `1/7`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
        ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
            if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
            const prize: string = collected.first().content;

            ctx.channel.send({content: "**How many winner(s) do you wan't ?** - `2/7`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                const winners: number = Number(collected.first().content);
                if(!winners) return ctx.channel.send({ content: "The provided value is not a number." });

                ctx.channel.send({content: "**How long do you wan't the giveaway to be ?** - `3/7`\nEx: 3d\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                    if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                    const duration: number = ms(collected.first().content);
                    if(duration - Date.now() > 1000 * 60 * 24 * 31) return ctx.channel.send({ content: "The giveaway duration can't be higher than 31 days." })

                    const conditions = new Map<string, string>();

                    ctx.channel.send({ content: "**Do you wan't users to be on a specific server to enter the giveaway ?** - `4/7`\nNote: All users will be able to participate in the giveaway, they will simply get a message telling them which server(s) to join if there are any.\n\n**YES** - Send an invitation link to the desired server, and specify links with `;` if there are multiple servers to join.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                    ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                        if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                        conditions.set('guilds', collected.first().content);
                        const guilds: Array<string> = conditions.get('guilds').trim().split(';');

                        const allGuilds: Map<string, Guild> = new Map<string, Guild>();
                        ctx.client.faster.checkLinks(guilds, allGuilds, true).then((servers) => {

                            ctx.channel.send({ content: "**Do you want users to be required to have certain role(s) to participate in the giveaway?** - `5/7`\n\n**YES** - Mention the desired role, and specify roles with `;` if there are multiple roles to have.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                                conditions.set('roles', collected.first().content);
                                const roles: Array<string> = conditions.get('roles').trim().split(';');
        
                                ctx.client.faster.checkRoles(roles, ctx.guild).then(() => {

                                    ctx.channel.send({ content: "**Do you want users to be required to send a certain number of messages in the desired channel(s) to participate?** - `6/7`\n\n**YES** - Send the channel spaced with the number of messages to be made by `:`, if there are several channels, separate the different channels by `;`.\n➜ Ex: #general : 50 ; #general-2 : 25\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                                    ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                        if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                                        conditions.set('messages', collected.first().content);
                                        const messages: Array<string> = conditions.get('messages').trim().split(';');
                
                                        ctx.client.faster.checkChannels(messages, ctx.guild).then(() => {
        
                                            ctx.channel.send({
                                                embeds: [
                                                    new MessageEmbed()
                                                    .setTitle('Summary of the giveaway')
                                                    .setColor(ctx.guild.me.displayHexColor)
                                                    .setDescription(`Prize: ${prize}\nWinner(s): ${winners}\nDuration: ${ms(duration)}\nConditions:\n➜ Server(s) to join: ${conditions.get('guilds') != 'no' ? conditions.get('guilds').trim().split(';').map(g => { return `[${allGuilds.get(g.trim())?.name}](${g.trim()})` }) : 'None'}\n➜ Roles to have: ${conditions.get('roles') != 'no' ? conditions.get('roles').trim().split(';').map(r => { return `${ctx.guild.roles.cache.get(r.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))}` }).join(', ') : 'None'}\n➜ Messages to send:\n${conditions.get('messages') != 'no' ? conditions.get('messages').trim().split(';').map(m => { return `> ➜ ${ctx.guild.channels.cache.get(m.split(':')[0].replace('<', '').replace('#', '').replace('>', '').trim())}: ${m.split(':')[1]} messages` }).join(',\n') : 'None'}`)
                                                ]
                                            })

                                            ctx.channel.send({ content: "**Finally, in wich channel do you want the giveaway to be launched ?** - `7/7`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*" })
                                            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                                if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: "You've successfully stopped the giveaway creation process."})
                                                
                                                const channel = collected.first().mentions.channels.first() || ctx.guild.channels.cache.get(collected.first().content.trim().split(' ')[0]);
                                                if(!channel || channel.type !== 'GUILD_TEXT') return ctx.reply({ content: "The provided value is not a TextChannel" });

                                                // @ts-ignore;
                                                const message: Message = await channel.send({ content: ":tada: The giveaway will be launched soon!" });
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
                                                await message.edit({ content: ':tada: **GIVEAWAY** :tada:', embeds: [ctx.client.giveaways.buildEmbed(giveaway, allGuilds)] })
                                                await message.react('🎉');

                                            })
                                            
                                        }).catch(err => {
                                            console.log(err);
                                            ctx.channel.send({ content: err })
                                        })
                                    })
                                }).catch(err => {
                                    console.log(err);
                                    ctx.channel.send({ content: err })
                                })
                            })

                        }).catch(err => {
                            console.log(err);
                            ctx.channel.send({ content: err })
                        })
                    })
                })

            }).catch((err: any) => ctx.channel.send({ content: "You haven't provided any prize on time." }));

        }).catch((err: any) => ctx.channel.send({ content: "You haven't provided any prize on time." }))
    }
}

module.exports = new GiveawayStart();