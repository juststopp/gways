const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class clearMessages extends Command {

    constructor(client) {
        super(client, {
            name: "clearmessages",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.youneedperm))
        const db = await this.client.database();
        if(!args[0]) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.clearmessages.args));
        if(args[0] === 'all') {
            await db.query(`UPDATE guilduser SET message = "0" WHERE guildid = "${message.guild.id}"`)
            await message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.clearmessages.alldone))
        } else {
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
            if(!user) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.unknownuser));
            await db.query(`UPDATE guilduser SET message='0' WHERE guildid='${message.guild.id}' && userid='${user.id}'`)
            await message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((language.clearmessages.singledone).replace('{user}', user.user.tag)))
        }
    }
}

module.exports = clearMessages;