import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions, GuildMember } from 'discord.js';
import { MessagesModel } from '../../utils/schemas/Messages.model';

class ClearStats extends Command {
    constructor() {
        super({
            name: "Clear member stats",
            category: "admin",
            type: "USER",
            description: "Clear all stats from a member",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD]
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const member: GuildMember = await ctx.guild.members.fetch(ctx.interaction.targetId);
        await MessagesModel.deleteMany({ id: member.user.id, guild: ctx.guild.id });
        ctx.reply({ content: ctx.lang.cmds.stats.cleared.replace('{member}', member), ephemeral: true})
    }
}

module.exports = new ClearStats();