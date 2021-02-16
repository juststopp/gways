const Discord = require("discord.js");
const ms = require("ms")
const parsems = require("parse-ms");
const config = require("../config");

module.exports = {

    getTime(timeMS) {
        if (timeMS) {
            if (isNaN(timeMS)) {
                timeMS = ms(timeMS)
                timeMS = parsems(timeMS)
                let days = timeMS.days
                let hours = timeMS.hours
                let minutes = timeMS.minutes
                let seconds = timeMS.seconds
                let time = `${days}d ${hours}h ${minutes}m ${seconds}s`
                if (days === 0) time = `${hours}h ${minutes}m ${seconds}s`
                if (hours === 0) time = `${minutes}m ${seconds}s`
                if (minutes === 0) time = `${seconds}s`
                return time
            } else {
                timeMS = parsems(timeMS)
                let days = timeMS.days
                let hours = timeMS.hours
                let minutes = timeMS.minutes
                let seconds = timeMS.seconds
                let time = `${days}d ${hours}h ${minutes}m ${seconds}s`
                if (days === 0) time = `${hours}h ${minutes}m ${seconds}s`
                if (days === 0 && hours === 0) time = `${minutes}m ${seconds}s`
                if (days === 0 && hours === 0 && minutes === 0) time = `${seconds}s`
                return time
            }
        } else {
            return "No number found ??"
        }
    },

    async generateGiveaway(client, data, color, giveawayid) {
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveawayid}`)
        if (giveaway && giveaway[0] && client && data) {
            let description = data.language.giveaway.replace(`{ggift}`, giveaway[0].cadeau).replace(`{gtime}`, `${(data.language.viewtimer).replace('{gid}', giveawayid)}`).replace(`{ghost}`, `<@${giveaway[0].authorid}>`).replace(`{gwin}`, giveaway[0].gagnant) + "\n\n"

            const giveawayEmbed = new Discord.MessageEmbed()
                .setColor(color)
                .setFooter(config.footer)

            if (giveaway[0].cserverid && giveaway[0].cserverid !== "0") {
                description = description + (data.language.react.guild).replace('{guild.name}', giveaway[0].cservername).replace('{guild.invite}', giveaway[0].cserverinvite) + '\n'
            }

            if (giveaway[0].message && giveaway[0].message !== 0) {
                description = description + (data.language.react.message).replace('{message}', giveaway[0].message) + '\n'
            }
            if (giveaway[0].voice && giveaway[0].voice !== "0") {
                description = description + data.language.react.voice + '\n'
            }
            if (giveaway[0].roleid && giveaway[0].roleid !== "0") {
                description = description + (data.language.react.role).replace('{role.name}', client.guilds.cache.get(giveaway[0].serverid).roles.cache.get(giveaway[0].roleid).name) + '\n'
            }

            giveawayEmbed.setDescription(description)

            if (giveawayEmbed) {
                return giveawayEmbed
            } else {
                return "error"
            }
        } else {
            return "error"
        }
    },

    async generateGiveawayEnded(client, data, giveawayid, gagnant) {
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveawayid}`)
        if (giveaway && giveaway[0] && client && data) {
            const description = data.language.giveawayfini.replace(`{ggift}`, giveaway[0].cadeau).replace(`{ghost}`, `<@${giveaway[0].authorid}>`).replace(`{gwin}`, (gagnant == 0 ? data.language.manqueparticipant : gagnant))
            let embed = new Discord.MessageEmbed()
                .setDescription(description)
                .addField("🧷 • Additional Links", "[Add the bot](https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot) | [Support server](https://discord.gg/h8V5cKrmXD) | [Vote for the bot](https://top.gg/bot/746404171783340164/vote) | [Nitro giveaways](https://discord.gg/DHSrEUAAwA)")
                .setFooter(config.footer)
            if(gagnant.length >= 1) embed.setColor('GREEN')
            else embed.setColor('RED')
            return embed;
        } else {
            return "error"
        }
    },

    generateGiveawayEmbedError(language) {
        let description = language
        const giveawayEmbed = new Discord.MessageEmbed()
            .setTitle("Giveaway system error :tada:")
            .setColor('#800000')
            .setDescription(description)
            .addField("🧷 • Additional Links", "[Add the bot](https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot) | [Support server](https://discord.gg/h8V5cKrmXD) | [Vote for the bot](https://top.gg/bot/746404171783340164/vote) | [Nitro giveaways](https://discord.gg/DHSrEUAAwA)")
            .setFooter(config.footer)
            .setURL(config.url)
            .setThumbnail(config.giveawayerrorthumbnail)
        return giveawayEmbed
    },

    generateGiveawaySystemEmbed(language) {
        let description = language
        const giveawayEmbed = new Discord.MessageEmbed()
            .setTitle("Giveaway system :tada:")
            .setColor(config.color)
            .setDescription(description)
            .addField("🧷 • Additional Links", "[Add the bot](https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot) | [Support server](https://discord.gg/h8V5cKrmXD) | [Vote for the bot](https://top.gg/bot/746404171783340164/vote) | [Nitro giveaways](https://discord.gg/DHSrEUAAwA)")
            .setFooter(config.footer)
            .setThumbnail(config.giveawaythumbnail)
            .setURL(config.url)
        return giveawayEmbed
    },

    async giveawayWinners(client, data, giveaway) {
        if (giveaway[0]) {
            const channel = await client.channels.cache.get(giveaway[0].channelid)
            const message = await channel.messages.fetch(giveaway[0].id)
            const reaction = message.reactions.resolve('🎉');
            const winnerss = await reaction.users.fetch();
            if (winnerss.filter(u => !u.bot).array().length < giveaway[0].gagnant) {
                return 0;
            }
            if (winnerss.filter(u => !u.bot).array().length > 0) {
                const rolledWinners = winnerss.filter(u => !u.bot).random(giveaway[0].gagnant);
                const winners = [];
                for (const u of rolledWinners) {
                    const isValidEntry = await !winners.some((winner) => winner.id === u.id);
                    if (isValidEntry) winners.push(u);
                    else {
                        for (const user of winners.array()) {
                            const alreadyRolled = winners.some((winner) => winner.id === user.id);
                            if (alreadyRolled) continue;
                            else {
                                winners.push(user);
                                break;
                            }
                        }
                    }
                }
                return winners.map(w => `${w}`).join(', ');
            } else {
                return "error";
            }
        } else {
            return "error"
        }
    },

    giveawayVerify(data, giveaway) {
        if (data && giveaway && giveaway[0]) {
            if (giveaway[0].finish === "yes") {
                return "end"
            } else {
                if (giveaway && giveaway[0]) {
                    if (giveaway[0].duration - (Date.now() - giveaway[0].datenow) < 5000) {
                        return "time";
                    } else {
                        return "valide";
                    }
                }
            }
        } else {
            return "invalide";
        }
    },
};
