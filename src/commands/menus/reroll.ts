import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions } from 'discord.js';

class Reroll extends Command {
    constructor() {
        super({
            name: "Reroll giveaway",
            category: "giveaways",
            type: "MESSAGE",
            description: "Reroll a giveaway",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD]
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('reroll');
        await command.run(ctx);
    }
}

module.exports = new Reroll();