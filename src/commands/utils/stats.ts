import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { GuildMember, MessageEmbed } from 'discord.js';
import { IMessages, MessagesModel } from '../../utils/schemas/Messages.model';

class StatsCmd extends Command {
    constructor() {
        super({
            name: "stats",
            category: "informations",
            type: "CHAT_INPUT",
            description: "Get your stats",
            options: []
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const member: GuildMember = await ctx.guild.members.fetch(ctx.author.id);
        if(member.user?.bot ?? ctx.author.bot) return ctx.reply({ content: ctx.lang.cmds.stats.notstatsbot, ephemeral: true})
        const stats: IMessages[] = await MessagesModel.find({ id: member.id ?? ctx.author.id, guild: ctx.guild.id }).then(m => m.filter(m => ctx.guild.channels.cache.find(c => c.id === m.channel)));

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setAuthor(`${member.user?.tag ?? ctx.author.tag}`, member.user?.displayAvatarURL({ dynamic: true }) ?? ctx.author.displayAvatarURL({ dynamic: true }))
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(`${stats.length > 0 ? stats.map(s => { return `${ctx.guild.channels.cache.get(s.channel)}: **${s.messages}** message${s.messages > 1 ? 's' : ''}` }).join('\n') : ctx.lang.cmds.stats.nostats}`)
            ]
        })
    }
}

module.exports = new StatsCmd();