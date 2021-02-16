const { getLanguage } = require("../utils/functions");
const Discord = require("discord.js");
const config = require("../config");
require('moment-duration-format')
moment = require("moment")
const axios = require("axios")

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        const data = {};
        if (message.author.bot || message.channel.type === "dm") return;

        const client = this.client;
        data.config = client.config;
        const database = await client.database();
        data.database = database;
        const user = await client.findUser(message.author.id);
        data.user = user;
        const guild = await client.findGuild(message.guild.id);
        data.guild = guild;
        const guilduser = await client.findOrCreateUserGuild(message.author.id, message.guild.id);
        data.guilduser = guilduser;

        if (guilduser) {
            const [messagesend] = await data.database.query(`SELECT * FROM guilduser WHERE userid = "${message.author.id}" && guildid = "${message.guild.id}"`)
            await data.database.query(`UPDATE guilduser SET message = "${messagesend[0].message + 1}" WHERE userid = "${message.author.id}" && guildid = "${message.guild.id}"`)
        }

        const prefix = data.config.prefix
        const prefix2 = "<@746404171783340164>"
        if(!message.content.startsWith(prefix) && !message.content.startsWith(prefix2)) return;

        if (message.guild) {
            const args = (message.content.startsWith(prefix) ? message.content.slice(prefix.length) : message.content.slice(prefix2.length)).trim().split(/ +/g);
            const command = args.shift().toLowerCase();
            const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
            if (cmd) {
                const user = await client.findOrCreateUser(message.author.id);
                data.user = user;
                const guild = await client.findOrCreateGuild(message.guild.id);
                data.guild = guild;
                const language = await client.functions.getLanguage(data.guild);
                data.language = language;
                this.client.statcord.postCommand(cmd.help.name, message.author.id, client)
                if (cmd.conf.ownerOnly === true && message.author.id !== client.config.ownerID) return
                return cmd.run(message, args, data, language);
            }
        }
    }
}
