import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { MessageEmbed, Permissions, Message } from 'discord.js';

class GiveawayStart extends Command {
    constructor() {
        super({
            name: "start",
            category: "giveaways",
            description: "Start the configuration of a giveaway.",
            examples: ["start"],
            testCmd: true,
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            botPerms: [Permissions.FLAGS.ADD_REACTIONS]
        })
    }

    async run(ctx: Context) {
        ctx.reply({content: "Let's create a new giveaway on this server!\n\nIn the next steps, you will have to complete some informations about the giveaway to start it. If you wan't to leave the giveaway creation process, reply to the messages below by saying `cancel`."})
        const filter: Function = (message: Message) => message.author.id == ctx.author.id && !message.author.bot;
        ctx.channel.send({content: "**What do you wan't the winner(s) to won ?** - `1/4`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*"})
    }
}

module.exports = new GiveawayStart();