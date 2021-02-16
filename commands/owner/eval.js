const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
const fs = require("fs");
const config = require('../../config.js');

class boteval extends Command {

    constructor(client) {
        super(client, {
            name: "eval",
            ownerOnly: true,
        });
    }

    async run(message, args, data, language) {
        if (!args[0]) return message.channel.send(`:x: Mauvaise utilisation`);
        try {
            var evaled = eval(args.join(" ").replace("bot.token", "\'Nop ?\'").replace("config.token", "\'Nop ?\'"));
            if (typeof evaled !== "string") evaled = require('util').inspect(evaled);
            return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(`\`\`\`js\n${evaled}\`\`\``)).catch(async(error) => {
                message.channel.send(this.client.globalManager.generateGlobalEmbedError(`\`\`\`x1\n${error}\n\`\`\``));
            });
        } catch (error) {
            return message.channel.send(this.client.globalManager.generateGlobalEmbedError(`\`\`\`x1\n${error}\n\`\`\``));
        };
    }
}

module.exports = boteval;