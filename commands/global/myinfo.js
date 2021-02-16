const Command = require("../../base/Command.js"), Discord = require("discord.js");
class myinfo extends Command {

    constructor(client) {
        super(client, {
            name: "myinfo",
        });
    }

    async run(message, args, data, language) {
        if (data.guilduser) {

            let [voted] = await (await this.client.database()).query(`SELECT * FROM votes WHERE id = "${message.author.id}"`);
            if(!voted[0]) {
                await (await this.client.database()).query(`INSERT INTO votes (id) VALUES("${message.author.id}")`)
            }
            [voted] = await (await this.client.database()).query(`SELECT * FROM votes WHERE id = "${message.author.id}"`);

            const texte = language.info.replace("msg", data.guilduser.message).replace("votes", voted[0].votes)
            const embed = new Discord.MessageEmbed()
                .setTitle("Your Informations :tada:")
                .setColor(this.client.config.color)
                .setDescription(texte)
                .setThumbnail(this.client.config.giveawaythumbnail)
                .setTimestamp()
                .setFooter(this.client.config.footer)
                .setURL(this.client.config.url)
            return message.channel.send(embed)
        }
    }
}

module.exports = myinfo;