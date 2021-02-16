const Command = require("../../base/Command.js");

class setbypassrole extends Command {

    constructor(client) {
        super(client, {
            name: "setbypassrole",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.youneedperm))
        let role = message.guild.roles.cache.find(r => r.id === args[0])
        if (!role) role = message.guild.roles.cache.find(r => r.name === args[0]);
        if (!role) role = message.mentions.roles.first();
        if (!role) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.roleintrouvable))
        if (role.id) message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.bypass))
        await data.database.query(`UPDATE guild SET rolebypass = "${role.id}" WHERE id = "${message.guild.id}"`)
    }
}

module.exports = setbypassrole;