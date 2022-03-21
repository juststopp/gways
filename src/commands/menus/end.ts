import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions } from 'discord.js';

class End extends Command {
    constructor() {
        super({
            name: "End giveaway",
            category: "giveaways",
            type: "MESSAGE",
            description: "End a giveaway",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD]
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('end');
        await command.run(ctx);
    }
}

module.exports = new End();