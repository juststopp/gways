import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { MessageEmbed, GuildMember } from 'discord.js';
import { IMessages, MessagesModel } from '../../utils/schemas/Messages.model';

class Stats extends Command {
    constructor() {
        super({
            name: "Get stats",
            category: "informations",
            type: "USER",
            description: "Stats from a member"
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const member: GuildMember = await ctx.guild.members.fetch(ctx.interaction.targetId);
        if(member.user?.bot ?? ctx.author.bot) return ctx.reply({ content: ctx.lang.cmds.stats.notstatsbot, ephemeral: true})
        const stats: IMessages[] = await MessagesModel.find({ id: member.id, guild: ctx.guild.id }).then(m => m.filter(m => ctx.guild.channels.cache.find(c => c.id === m.channel)));

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setAuthor(`${member.user?.tag}`, member.user?.displayAvatarURL({ dynamic: true }))
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(`${stats.length > 0 ? stats.map(s => { return `${ctx.guild.channels.cache.get(s.channel)}: **${s.messages}** message${s.messages > 1 ? 's' : ''}` }).join('\n') : ctx.lang.cmds.stats.nostats}`)
            ]
        })
    }
}

module.exports = new Stats();