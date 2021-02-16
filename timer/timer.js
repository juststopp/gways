exports.run = async (client) => {
    client.setInterval(async function () {
        const [giveaways] = await (await client.database()).query(`SELECT * FROM giveaway`)
        if (giveaways && giveaways[0]) {
            giveaways.forEach(async (giveaway) => {
                if (giveaway.channelid) {
                    if (giveaway.finish === "yes" || giveaway.id === "1") return
                    let channel = client.channels.cache.get(giveaway.channelid)
                    if (channel) {
                        try {
                            await channel.messages.fetch(giveaway.id)
                                .then(async (message) => {
                                    if (message) {
                                        let time = giveaway.duration - (Date.now() - giveaway.datenow)
                                        if (time) {
                                            if (time < 10000) return
                                            const data = {}
                                            data.config = client.config;
                                            const database = await client.database();
                                            data.database = database;
                                            const user = await client.findUser(giveaway.authorid);
                                            data.user = user;
                                            const guild = await client.findGuild(giveaway.serverid);
                                            data.guild = guild;
                                            const language = await client.functions.getLanguage(data.guild);
                                            data.language = language;
                                        }
                                    }
                                }).catch(err => { return; });
                        } catch (error) { return; };
                    }
                }
            })
        }
    }, 8000);
};     