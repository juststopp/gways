import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions } from 'discord.js';

class Edit extends Command {
    constructor() {
        super({
            name: "Edit giveaway",
            category: "giveaways",
            type: "MESSAGE",
            description: "Edit a giveaway",
            userPerms: [Permissions.FLAGS.MANAGE_GUILD]
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('edit');
        await command.run(ctx);
    }
}

module.exports = new Edit();