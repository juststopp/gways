import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { MessageEmbed, Permissions } from 'discord.js';

class HelpCMD extends Command {
    constructor() {
        super({
            name: "help",
            category: "informations",
            type: "CHAT_INPUT",
            description: "Get the list of all commands",
            options: [],
            botPerms: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS]
        })
    }

    async run(ctx: Context) {

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(ctx.lang.helptitle)
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(ctx.lang.help)
            ]
        })
    }
}

module.exports = new HelpCMD();