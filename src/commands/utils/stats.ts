import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions, GuildMember, MessageEmbed } from 'discord.js';
import { IMessages, MessagesModel } from '../../utils/schemas/Messages.model';

class StatsCmd extends Command {
    constructor() {
        super({
            name: "stats",
            category: "informations",
            type: "CHAT_INPUT",
            description: "Get stats from a member",
            options: []
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const member: GuildMember = await ctx.guild.members.fetch(ctx.interaction?.targetId) || await ctx.guild.members.fetch(ctx.author.id);
        if(member.user?.bot ?? ctx.author.bot) return ctx.reply({ content: "You can't see the statistics of a bot.", ephemeral: true})
        const stats: IMessages[] = await MessagesModel.find({ id: member.id ?? ctx.author.id, guild: ctx.guild.id }).then(m => m.filter(m => ctx.guild.channels.cache.find(c => c.id === m.channel)));

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setAuthor(`${member.user?.tag ?? ctx.author.tag}`, member.user?.displayAvatarURL({ dynamic: true }) ?? ctx.author.displayAvatarURL({ dynamic: true }))
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(`${stats.length > 0 ? stats.map(s => { return `${ctx.guild.channels.cache.get(s.channel)}: **${s.messages}** message${s.messages > 1 ? 's' : ''}` }).join('\n') : 'No data for this user.'}`)
            ]
        })
    }
}

module.exports = new StatsCmd();