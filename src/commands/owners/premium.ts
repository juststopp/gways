import Command from '../../utils/Command';
import Context from '../../utils/Context';
import type Client from '../../../main';
import { IGuild, GuildModel } from '../../utils/schemas/Guild.model';
import { Guild, Collection } from 'discord.js';
import ms from 'ms';

class Premium extends Command {
    constructor() {
        super({
            name: "premium",
            category: "owners",
            description: "Adds or remove premium to a guild.",
            type: "CHAT_INPUT",
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "add",
                    description: "Add premium to a guild",
                    options: [
                        {
                            type: "STRING",
                            name: "guild_id",
                            description: "The ID of the guild",
                            required: true
                        },
                        {
                            type: "STRING",
                            name: "duration",
                            description: "The duration to add",
                            choices: [
                                {
                                    name: "7 Days",
                                    value: "7d"
                                },
                                {
                                    name: "14 Days",
                                    value: "14d"
                                },
                                {
                                    name: "1 Month",
                                    value: "31d"
                                },
                                {
                                    name: "2 Months",
                                    value: "62d"
                                }
                            ],
                            required: true
                        }
                    ]
                }, {
                    type: "SUB_COMMAND",
                    name: "remove",
                    description: "Remove premium from a guild",
                    options: [
                        {
                            type: "STRING",
                            name: "guild_id",
                            description: "The ID of the guild",
                            required: true
                        },
                        {
                            type: "STRING",
                            name: "duration",
                            description: "The duration to remove",
                            choices: [
                                {
                                    name: "7 Days",
                                    value: "7d"
                                },
                                {
                                    name: "14 Days",
                                    value: "14d"
                                },
                                {
                                    name: "1 Month",
                                    value: "31d"
                                },
                                {
                                    name: "2 Months",
                                    value: "62d"
                                }
                            ],
                            required: true
                        }
                    ]
                }
            ],
            ownerOnly: true
        })
    }

    async run(ctx: Context) {
        const ID: string = ctx.args.getString("guild_id");
        // @ts-ignore;
        const g: Collection<Guild> = await ctx.client.shard.broadcastEval((client: typeof Client, context: any) => client.guilds.cache.get(context.guildId), { context: { guildId: ID }});
        const guild: Guild = g.find((g: { id: string; }) => g.id === ID);
        if(!guild) return ctx.reply({ content: "The bot isn't in this guild!", ephemeral: true})

        const guildConfig: IGuild = await GuildModel.findOne({ id: ID }).then((g: any) => g || GuildModel.create({ id: ID }));

        const duration: number = ms(ctx.args.getString('duration'));
        const premium: number = ctx.args.getSubcommand(true) == 'add' ? (guildConfig.premium - Date.now() < 0) ? Date.now() + duration : guildConfig.premium + duration : guildConfig.premium - duration;
        guildConfig.set('premium', premium)
        guildConfig.save();

        ctx.reply({ content: `You've just ${ctx.args.getSubcommand(true) == 'add' ? 'added' : 'removed'} **${ms(duration, { long: true })}** of premium ${ctx.args.getSubcommand(true) == 'add' ? 'to' : 'from'} the guild named \`${guild.name}\`.` });
    }
}

module.exports = new Premium();