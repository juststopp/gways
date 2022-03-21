import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions } from 'discord.js';

class Restart extends Command {
    constructor() {
        super({
            name: "Restart giveaway",
            category: "giveaways",
            type: "MESSAGE",
            description: "Restart a giveaway",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            premium: true
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('restart');
        await command.run(ctx);
    }
}

module.exports = new Restart();