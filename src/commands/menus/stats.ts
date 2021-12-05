import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Permissions } from 'discord.js';

class Stats extends Command {
    constructor() {
        super({
            name: "Get stats",
            category: "informations",
            type: "USER",
            description: "Stats from a member"
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('stats');
        await command.run(ctx);
    }
}

module.exports = new Stats();