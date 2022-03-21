import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Message, Permissions, CollectorFilter, Collection, Guild, MessageEmbed } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { IGuild, GuildModel } from '../../utils/schemas/Guild.model';
import ms from 'ms';

class RestartCMD extends Command {
    constructor() {
        super({
            name: "restart",
            category: "giveaways",
            type: "CHAT_INPUT",
            description: "Restart a giveaway",
            options: [
                {
                    type: "STRING",
                    name: "giveaway_id",
                    description: "The ID of the giveaway message",
                    required: true
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            premium: true
        })
    }

    async run(ctx: Context) {
        await ctx.reply({ content: ctx.lang.cmds.restart.letsgo, ephemeral: true })
        // @ts-ignore;
        const ID: string = ctx.interaction?.targetId || ctx.args.getString('giveaway_id');
        // @ts-ignore;
        const giveaway: IGiveaway[] = await GiveawayModel.find({ id: ID, guild: ctx.guild.id }).then(g => g);
        const guildConfig: IGuild = await GuildModel.findOne({ id: ctx.guild.id }).then(g => g || GuildModel.create({ id: ctx.guild.id }));

        if(!giveaway[0]) return ctx.channel.send({ content: ctx.lang.cmds.notagiveawayembed });        
        if(!giveaway[0].ended) return ctx.channel.send({ content: ctx.lang.cmds.ended });
        
        const filter: CollectorFilter<[Message]> = (message: Message) => message.author.id === ctx.author.id && !message.author.bot;
        const m: Message = await ctx.channel.send({ content: ctx.lang.cmds.start.steps.three })
        ctx.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected: Collection<string, Message>) => {
            if(collected.first().content.toLowerCase().includes('cancel')) return ctx.channel.send({ content: ctx.lang.cmds.start.stopped })
            const duration: number = ms(collected.first().content);
            if(duration - Date.now() > 1000 * 60 * 24 * ((guildConfig.premium - Date.now()) > 0 ? 31 : 14)) return ctx.channel.send({ content: ctx.lang.cmds.start.maxduration.replace('{max}', ((guildConfig.premium - Date.now()) > 0 ? "31" : "14")) })
        
            giveaway[0].set('end', (Date.now() + duration).toString())
            giveaway[0].set('ended', false)
            giveaway[0].save();

            const channel: any = ctx.guild.channels.cache.get(giveaway[0].channel);
            const message: Message = await channel.messages.fetch(giveaway[0].id).catch((error: any) => { return ctx.channel.send({ content: ctx.lang.cmds.msgdeleted }) })
            const embed: MessageEmbed = await ctx.client.giveaways.buildEmbed(giveaway[0])
            await message.edit({ content: ctx.lang.running, embeds: [embed] })
            ctx.editReply({ content: ctx.lang.cmds.restart.restarted.replace('{link}', `https://discord.com/channels/${ctx.guild.id}/${channel.id}/${message.id}`)})

            m.delete();
            collected.first().delete().catch();
        })
    }
}

module.exports = new RestartCMD();