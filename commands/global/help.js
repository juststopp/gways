const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class help extends Command {

    constructor(client) {
        super(client, {
            name: "help",
        });
    }

    async run(message, args, data, language) {
        const help = new Discord.MessageEmbed()
            .setTitle(language.title)
            .setColor(this.client.config.color)
            .setDescription(language.help)
            .setThumbnail(this.client.config.giveawaythumbnail)
            .setTimestamp()
            .setFooter(this.client.config.footer)
            .setURL(this.client.config.url)
        return message.channel.send(help);
    }
}

module.exports = help;