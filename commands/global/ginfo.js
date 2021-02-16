const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class GInfo extends Command {

    constructor(client) {
        super(client, {
            name: "ginfo",
        });
    }

    async run(message, args, data, language) {

        const [giveaways] = await (await this.client.database()).query(`SELECT * FROM giveaway`);

        const help = new Discord.MessageEmbed()
            .setTitle(language.title)
            .setColor(this.client.config.color)
            .setDescription((language.ginfo).replace('{total}', giveaways.length).replace('{finish}', giveaways.filter((g) => g.finish == "yes").length).replace('{current}', giveaways.filter((g) => g.finish == "no").length))
            .setThumbnail(this.client.config.giveawaythumbnail)
            .setTimestamp()
            .setFooter(this.client.config.footer)
            .setURL(this.client.config.url)
        return message.channel.send(help);
    }
}

module.exports = GInfo;