const Discord = require("discord.js");

module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run(guild) {
        await this.client.findOrCreateGuild(guild.id);
        this.client.channels.cache.get('801467866436075560').setName(`🤖・${this.client.guilds.cache.size}/600`)
    }
};  
