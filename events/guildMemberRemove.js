module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(member) {

        const data = {};
        const client = this.client;
        const database = await client.database();
        data.database = database;
        const [giveawaylength] = await data.database.query(`SELECT * FROM giveaway WHERE finish = "no"`)
        if (giveawaylength !== 0) {
            giveawaylength.forEach(async (giveaway) => {
                if (giveaway.channelid) {
                    if (giveaway.id) {
                        const channel = client.channels.cache.get(giveaway.channelid);
                        if (channel) {
                            await channel.messages.fetch(giveaway.id)
                                .then(async (message) => {
                                    if (message) {
                                        message.reactions.resolve("🎉").users.remove(member.id).catch();
                                    }
                                }).catch(() => undefined)
                        }
                    }
                }
            })
        }
    };
}

