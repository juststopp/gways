const Command = require("../../base/Command.js");
class gdelete extends Command {
    constructor(client) {
        super(client, {
            name: "gdelete",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.youneedperm))
        var giveawayID = args[0];
        if(!giveawayID) return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.needargs));
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveawayID}`)
        const verify = await this.client.giveawayManager.giveawayVerify(data, giveaway)
        if (verify === "invalide") return message.channel.send(this.client.giveawayManager.generateGiveawayEmbedError(language.invalide))
        const channel = message.guild.channels.cache.get(giveawayID)
        if (channel) channel.messages.fetch(giveawayID)
            .then(async (message) => {
                if (mesage && message.deletable) {
                    message.delete();
                }
            })
        message.channel.send(this.client.giveawayManager.generateGiveawaySystemEmbed(language.giveawaydelete))
        await (await this.client.database()).query(`DELETE FROM giveaway WHERE id = "${giveawayID}"`)
    }
}

module.exports = gdelete;