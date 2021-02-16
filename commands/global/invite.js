const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class invite extends Command {

    constructor(client) {
        super(client, {
            name: "invite",
        });
    }

    async run(message, args, data, language) {
        return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.inviteCMD))
    }
}

module.exports = invite;