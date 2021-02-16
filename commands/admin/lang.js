const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class lang extends Command {

    constructor(client) {
        super(client, {
            name: "lang",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.youneedperm))
        if (!["fr", "en"].includes(args[0])) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.providelanguage))
        await (await this.client.database()).query(`UPDATE guild SET lang = "${args[0]}" WHERE id = "${message.guild.id}"`)
        message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.modify));
    }
}

module.exports = lang;