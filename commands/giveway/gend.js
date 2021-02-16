const Command = require("../../base/Command.js"), Discord = require("discord.js"), ms = require("ms"), axios = require("axios")

class gend extends Command {
    constructor(client) {
        super(client, {
            name: "gend",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.youneedperm2))
        var giveawayID = args[0]
        if(!giveawayID) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.needargs));
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveawayID}`)
        const verify = await this.client.giveawayManager.giveawayVerify(data, giveaway);
        if (verify === "time") return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.time))
        if (verify === "invalide" || verify === "end") return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.invalide))
        message.channel.send(this.client.giveawayManager.generateGiveawaySystemEmbed(language.giveawayend))
        const winners = await this.client.giveawayManager.giveawayWinners(this.client, data, giveaway)
        const texte = (winners == 0 ? language.manqueparticipant : language.gagner.replace("auteur", winners).replace("recompense", giveaway[0].cadeau));
        const channel = message.guild.channels.cache.get(giveaway[0].channelid)
        if (channel) await channel.send(texte)
        if (channel) await channel.messages.fetch(giveawayID)
            .then(async (message) => {
                if (message) {
                    const embed = await this.client.giveawayManager.generateGiveawayEnded(this.client, data, giveawayID, winners)
                    await message.edit(":tada: **GIVEAWAY ENDED** :tada:", embed);
                    await data.database.query(`UPDATE giveaway SET finish = "yes" WHERE id = "${giveawayID}"`)
                }
            })
    }
}

module.exports = gend;