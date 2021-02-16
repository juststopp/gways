module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(oldState, newState) {
        let data = {}
        let client = this.client;
        const user = await client.findOrCreateUserGuild(oldState.id, oldState.guild.id);
        data.user = user;

        if (user) {
            if (!oldState.channel && newState.channel) {
                await (await this.client.database()).query(`UPDATE guilduser SET voice = "1" WHERE userid = "${oldState.id}" && guildid = "${oldState.guild.id}"`)
            }

            if (oldState.channel && !newState.channel) {
                await (await this.client.database()).query(`UPDATE guilduser SET voice = "0" WHERE userid = "${oldState.id}" && guildid = "${oldState.guild.id}"`)
            }
        }
    }
}

