import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import { IMessages, MessagesModel } from '../../utils/schemas/Messages.model';

class ClearStats extends Command {
    constructor() {
        super({
            name: "clearstats",
            category: "admin",
            type: "CHAT_INPUT",
            description: "Clear stats from a member",
            options: [
                {
                    type: "STRING",
                    name: "user",
                    description: "ID of the user you wan't to clear OR all",
                    required: true
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD]
        })
    }

    async run(ctx: Context) {
        if(ctx.args.getString('user').trim().toLowerCase() === "all") {
            await MessagesModel.deleteMany({ guild: ctx.guild.id })
            return ctx.reply({ content: ctx.lang.cmds.clearstats.doneall, ephemeral: true })
        } else {
            const member: GuildMember = await ctx.guild.members.fetch(ctx.args.getString('user'));
            if(!member || member.user.bot) return ctx.reply({ content: ctx.lang.cmds.clearstats.nomember, ephemeral: true });

            await MessagesModel.deleteMany({ id: member.user.id, guild: ctx.guild.id })
            return ctx.reply({ content: ctx.lang.cmds.stats.cleared.replace('{member}', member), ephemeral: true });
        }
    }
}

module.exports = new ClearStats();