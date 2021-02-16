const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class lang extends Command {

    constructor(client) {
        super(client, {
            name: "log",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.youneedperm))
        if(!args[0]) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.log.args));
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        await (await this.client.database()).query(`UPDATE guild SET logid='${channel.id}' WHERE id='${message.guild.id}'`);
        return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((language.log.done).replace('{channel}', channel).replace('{id}', channel.id)))
    }
}

module.exports = lang;