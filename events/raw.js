module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(raw) {
        if (!['MESSAGE_REACTION_ADD'].includes(raw.t)) return;
        if (raw.d.emoji.name != "🎉") return;
        
        const client = this.client;
        const channel = client.channels.cache.get(raw.d.channel_id);
        const message = await channel.messages.fetch(raw.d.message_id)
        const member = await client.users.fetch(raw.d.user_id);
        if (!message) return
        const reaction = await message.reactions.resolve("🎉");
        client.emit('messageReactionAdd', reaction, member);
        /*if (raw.d.user_id === this.client.config.botID) return;

        const data = {};
        const client = this.client;
        data.config = client.config;
        const database = await client.database();
        data.database = database;
        const user = await client.findUser(raw.d.user_id);
        data.user = user;
        const guild = await client.findGuild(raw.d.guild_id);
        data.guild = guild;
        const guilduser = await client.findOrCreateUserGuild(raw.d.user_id, raw.d.guild_id)
        data.guilduser = guilduser;

        const [giveawaylength] = await data.database.query(`SELECT * FROM giveaway`)
        if (giveawaylength !== 0) {
            const channel = client.channels.cache.get(raw.d.channel_id);
            const message = await channel.messages.fetch(raw.d.message_id)
            if (!message) return
            const reaction = await message.reactions.cache.get("🎉");
            if (!reaction) return;
            if (raw.d.user_id === this.client.config.botID) return;
            const member = await client.users.cache.get(raw.d.user_id)
            if (!member) return;
            const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = "${raw.d.message_id}"`)
            if (giveaway && giveaway[0]) {
                data.giveaway = giveaway[0]
                if (raw.t === 'MESSAGE_REACTION_ADD') {
                    client.emit('messageReactionAdd', reaction, member);
                }
            }
        }*/
    }
}



