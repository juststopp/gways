const { ReactionUserManager } = require("discord.js");
const Command = require("../../base/Command.js");
class greroll extends Command {

    constructor(client) {
        super(client, {
            name: "greroll",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.youneedperm2))
        var giveawayID = args[0]
        if(!giveawayID) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.needargs));
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveawayID}`)
        const verify = await this.client.giveawayManager.giveawayVerify(data, giveaway);
        if(verify != "end") return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.allreadyEnded))
        if (verify === "invalide") return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.invalide))
        const winners = await this.client.giveawayManager.giveawayWinners(this.client, data, giveaway)
        const texte = (winners == 0 ? language.manqueparticipant : language.gagner.replace("auteur", winners).replace("recompense", giveaway[0].cadeau));
        const channel = message.guild.channels.cache.get(giveaway[0].channelid)
        if (channel) {
            channel.send(texte)
        }
    }
}

module.exports = greroll;