import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { MessageEmbed, Permissions } from 'discord.js';

class PremiumInfoCMD extends Command {
    constructor() {
        super({
            name: "premiuminfo",
            category: "informations",
            type: "CHAT_INPUT",
            description: "Get informations about the premium offer",
            options: [],
            botPerms: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS]
        })
    }

    async run(ctx: Context) {

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(ctx.lang.cmds.premium.title)
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(ctx.lang.cmds.premium.description)
            ]
        })
    }
}

module.exports = new PremiumInfoCMD();