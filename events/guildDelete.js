const Discord = require("discord.js");
const config = require("../config");

module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(guild) {
        this.client.channels.cache.get('801467866436075560').setName(`🤖・${this.client.guilds.cache.size}/600`)
        let res = await this.client.shard.fetchClientValues('guilds.cache.size').catch(() => undefined)
        if (res.length === config.shard) {
            await (await this.client.database()).query(`DELETE FROM guild WHERE id = "${guild.id}"`);
            await (await this.client.database()).query(`DELETE FROM giveaway WHERE serverid = "${guild.id}"`);
            await (await this.client.database()).query(`DELETE FROM guilduser WHERE serverid = "${guild.id}"`);
        }
    }
};  
