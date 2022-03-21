import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions, User } from 'discord.js';
import { IUser, UserModel } from '../../utils/schemas/User.model';

class HelpCMD extends Command {
    constructor() {
        super({
            name: "notifs",
            category: "configuration",
            type: "CHAT_INPUT",
            description: "Enable or disable notifications.",
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "on",
                    description: "Enable notifications."
                }, {
                    type: "SUB_COMMAND",
                    name: 'off',
                    description: "Disable notifications."
                }
            ],
            botPerms: [Permissions.FLAGS.USE_EXTERNAL_EMOJIS]
        })
    }

    async run(ctx: Context) {
        const user: IUser = await UserModel.findOne({ id: ctx.author.id }).then(u => u || UserModel.create({ id: ctx.author.id }));
        user.set('notifs', ctx.args.getSubcommand())
        user.save();

        ctx.reply({ content: ctx.lang.notifs.changed.replace('{status}', ctx.lang.notifs[ctx.args.getSubcommand()]), ephemeral: true })
    }
}

module.exports = new HelpCMD();