import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { Permissions, Message, CollectorFilter, Collection, Guild, Snowflake, Client } from 'discord.js';
import ms from 'ms';
import axios from 'axios';

class GiveawayStart extends Command {
    constructor() {
        super({
            name: "start",
            category: "giveaways",
            description: "Start the configuration of a giveaway.",
            examples: ["start"],
            testCmd: true,
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            botPerms: [Permissions.FLAGS.ADD_REACTIONS]
        })
    }

    async run(ctx: Context) {
        ctx.reply({content: "Let's create a new giveaway on this server!\n\nIn the next steps, you will have to complete some informations about the giveaway to start it. If you wan't to leave the giveaway creation process, reply to the messages below by saying `cancel`."})
        
        const filter: CollectorFilter<[Message]> = (message: Message) => message.author.id === ctx.author.id && !message.author.bot; 
        
        ctx.channel.send({content: "**What do you wan't the winner(s) to won ?** - `1/???`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
        ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
            const prize: string = collected.first().content;

            ctx.channel.send({content: "**How many winner(s) do you wan't ?** - `2/???`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                const winners: number = Number(collected.first().content);
                if(!winners) return ctx.channel.send({ content: "The provided value is not a number." });

                ctx.channel.send({content: "**How long do you wan't the giveaway to be ?** - `3/???`\nEx: 3d\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then((collected: Collection<string, Message>) => {
                    const duration: number = ms(collected.first().content);
                    if(duration - Date.now() > 1000 * 60 * 24 * 31) return ctx.channel.send({ content: "The giveaway duration can't be higher than 31 days." })

                    const conditions = new Map<string, string>();

                    ctx.channel.send({ content: "**Do you wan't users to be on a specific server to enter the giveaway ?** - `4/???`\nNote: All users will be able to participate in the giveaway, they will simply get a message telling them which server(s) to join if there are any.\n\n**YES** - Send an invitation link to the desired server, and specify links with `;` if there are multiple servers to join.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                    ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                        conditions.set('guilds', collected.first().content);
                        const guilds: Array<string> = conditions.get('guilds').trim().split(';');

                        ctx.client.faster.checkLinks(guilds).then(() => {

                            ctx.channel.send({ content: "**Do you want users to be required to have certain roles to participate in the giveaway?** - `5/???`\n\n**YES** - Send an invitation link to the desired server, and specify links with `;` if there are multiple servers to join.\n**NO** - Reply `no` to this message.\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"});
                            ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
                                conditions.set('roles', collected.first().content);
                                const roles: Array<string> = conditions.get('roles').trim().split(';');
        
                                ctx.client.faster.checkRoles(roles, ctx.guild).then(() => {

                                    ctx.channel.send('Done!');
        
                                }).catch(err => {
                                    ctx.channel.send({ content: err })
                                })
                            })

                        }).catch(err => {
                            ctx.channel.send({ content: err })
                        })
                    })
                })

            }).catch(err => ctx.channel.send({ content: "You haven't provided any prize on time." }));

        }).catch(err => ctx.channel.send({ content: "You haven't provided any prize on time." }))
    }
}

module.exports = new GiveawayStart();