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
                            const verify = await channel.messages.fetch(giveaway.id);
                            if (!verify) {
                                await (await client.database()).query(`DELETE FROM giveaway WHERE id = "${giveaway.id}"`);
                            }
                        } catch (error) {
                            undefined;
                        }
                    }
                }
            })
        }
    }, 50000);
};     