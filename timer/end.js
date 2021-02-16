exports.run = async (client) => {
    client.setInterval(async function () {
        const [giveaways] = await (await client.database()).query(`SELECT * FROM giveaway`)
        if (giveaways && giveaways[0]) {
            giveaways.forEach(async (giveaway) => {
                if (giveaway.id) {
                    if (giveaway.finish === "yes" || giveaway.id === "1") return
                    let channel = client.channels.cache.get(giveaway.channelid)
                    if (channel) {
                        try {
                            await channel.messages.fetch(giveaway.id)
                                .then(async (message) => {
                                    if (message) {
                                        if (giveaway.duration - (Date.now() - giveaway.datenow) < 15000) {
                                            const data = {};
                                            const database = await client.database();
                                            data.database = database;
                                            const guild = await client.findGuild(giveaway.serverid);
                                            data.guild = guild;
                                            const language = await client.functions.getLanguage(data.guild);
                                            data.language = language;
                                            const [giveawayend] = await data.database.query(`SELECT * FROM giveaway WHERE id = ${giveaway.id}`)
                                            const winners = await client.giveawayManager.giveawayWinners(client, data, giveawayend)
                                            const texte = (winners == 0 ? language.manqueparticipant : language.gagner.replace("auteur", winners).replace("recompense", giveaway.cadeau));
                                            await (await client.database()).query(`UPDATE giveaway SET finish = "yes" WHERE id = "${giveaway.id}"`);
                                            await client.shard.broadcastEval(`let channel = this.channels.cache.get("${giveaway.channelid}"); if(channel) {  channel.send("${texte}") }`)
                                            const embed = await client.giveawayManager.generateGiveawayEnded(client, data, giveaway.id, winners)
                                            await message.edit(":tada: **GIVEAWAY ENDED** :tada:", embed);
                                        }
                                    }
                                }).catch(err => { return; });
                            } catch (error) { return; };
                    }
                }
            })
        }
    }, 3000);
};     