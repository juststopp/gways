const Discord = require("discord.js");
const ms = require("ms")
const parsems = require("parse-ms");
const config = require("../config");

module.exports = {

    generateGlobalEmbedError(language) {
        let description = language
        const giveawayEmbed = new Discord.MessageEmbed()
            .setTitle("Giveaway system :tada:")
            .setColor('#800000')
            .setDescription(description)
            .addField("🧷 • Additional Links", `[Add the bot](https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot) | [Support server](https://discord.gg/h8V5cKrmXD) | [Vote for the bot](https://top.gg/bot/746404171783340164/vote) | [Nitro giveaways](https://discord.gg/DHSrEUAAwA)`)
            .setFooter(config.footer)
            .setURL(config.url)
            .setThumbnail(config.giveawayerrorthumbnail)
        return giveawayEmbed
    },
    
    generateGlobalSystemEmbed(language) {
        let description = language
        const giveawayEmbed = new Discord.MessageEmbed()
            .setTitle("Giveaway system :tada:")
            .setColor(config.color)
            .setDescription(description)
            .addField("🧷 • Additional Links", `[Add the bot](https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot) | [Support server](https://discord.gg/h8V5cKrmXD) | [Vote for the bot](https://top.gg/bot/746404171783340164/vote) | [Nitro giveaways](https://discord.gg/DHSrEUAAwA)`)
            .setFooter(config.footer)
            .setURL(config.url)
            .setThumbnail(config.giveawaythumbnail)
        return giveawayEmbed
    },
};
