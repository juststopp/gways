const Command = require("../../base/Command.js"), Discord = require("discord.js");

class top extends Command {

    constructor(client) {
        super(client, {
            name: "top",
        });
    }

    async run(message, args, data, language) {
        const limit = args[0] || 10;
        if(isNaN(limit)) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.limitnan));
        if(Number(limit) > 50 || Number(limit) < 5) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.limitlimited))
        const [topmessage] = await data.database.query(`SELECT * FROM guilduser WHERE guildid = "${message.guild.id}" ORDER BY message DESC LIMIT ${limit}`)
        const array = [];
        for (let i = 0; i < limit && i < topmessage.length; i++) {
            if (topmessage.length !== 0 && i < topmessage.length) {
                if((topmessage[i].userid == message.author.id) == false) {
                    array.push([`\`#${i + 1}\` <@${topmessage[i].userid}> : \`${topmessage[i].message} message${topmessage[i].message > 1 ? 's' : ''}\``])
                } else if(topmessage[i].userid == message.author.id) array.push([`\`#${i + 1}\` <@${topmessage[i].userid}> : \`${topmessage[i].message} message${topmessage[i].message > 1 ? 's' : ''}\` | <:locate:801866984421326918> ${language.youarehere}`])
            }
        }
        
        const embed = new Discord.MessageEmbed()
            .setTitle("Top messages :star:")
            .setColor(this.client.config.color)
            .setDescription(array.join("\n"))
            .setThumbnail(this.client.config.giveawaythumbnail)
            .setTimestamp()
            .setFooter(this.client.config.footer)
            .setURL(this.client.config.url)
        return message.channel.send(embed);
    }
}

module.exports = top;
