import Context from '../../utils/Context';
import Command from '../../utils/Command';

class Delete extends Command {
    constructor() {
        super({
            name: "Delete giveaway",
            category: "giveaways",
            type: "MESSAGE",
            description: "Delete a giveaway"
        })
    }

    async run(ctx: Context) {
        const command: Command = ctx.client.commands.findCommand('delete');
        await command.run(ctx);
    }
}

module.exports = new Delete();