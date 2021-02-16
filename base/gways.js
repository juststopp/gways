const { Client, Collection } = require("discord.js"),
    path = require("path");
const mysql = require('mysql2');
const config = require("../config");
const statcord = require("statcord.js");
const createConnextion = mysql.createPool({ host: config.mysql.host, port: config.mysql.port, user: config.mysql.user, password: config.mysql.password, database: config.mysql.database, waitForConnections: true, connectionLimit: 1, queueLimit: 0 });

class Gways extends Client {

    constructor(options) {
        super(options);
        this.config = require("../config");
        this.commands = new Collection();
        this.aliases = new Collection();
        this.functions = require("../utils/functions");
        this.giveawayManager = require("../utils/giveawayManager");
        this.globalManager = require("../utils/globalManager");
        this.statcord = statcord.ShardingClient
    }

    loadCommand(commandPath, commandName) {
        const props = new (require(`.${commandPath}${path.sep}${commandName}`))(this);
        props.conf.location = commandPath;
        if (props.init) {
            props.init(this);
        }
        this.commands.set(props.help.name, props);
        props.conf.aliases.forEach((alias) => {
            this.aliases.set(alias, props.help.name);
        });
        return false;
    }

    async unloadCommand(commandPath, commandName) {
        let command;
        if (this.commands.has(commandName)) {
            command = this.commands.get(commandName);
        } else if (this.aliases.has(commandName)) {
            command = this.commands.get(this.aliases.get(commandName));
        }
        if (!command) {
            return;
        }
        if (command.shutdown) {
            await command.shutdown(this);
        }
        delete require.cache[require.resolve(`.${commandPath}${path.sep}${commandName}.js`)];
        return false;
    }

    async database() {
        var promiseDB = createConnextion.promise();
        return promiseDB;
    }

    async findOrCreateUser(user) {
        const [rows] = await (await this.database()).query(`SELECT * FROM user WHERE id = "${user}"`);
        if (rows.length === 0) {
            const [createUser] = await (await this.database()).query(`INSERT INTO user (id) VALUES ('${user}')`);
            return createUser[0];
        } else {
            return rows[0];
        }
    }

    async findOrCreateGuild(guild) {
        const [rows] = await (await this.database()).query(`SELECT * FROM guild WHERE id = "${guild}"`);
        if (rows.length === 0) {
            const createGuild = await (await this.database()).query(`INSERT INTO guild (id) VALUES ('${guild}')`);
            return createGuild[0];
        } else {
            return rows[0];
        }
    }

    async findUser(user) {
        const [rows] = await (await this.database()).query(`SELECT * FROM user WHERE id = "${user}"`);
        if (rows.length === 1) {
            return rows[0];
        }
    }

    async findOrCreateUserGuild(user, guild) {
        const [rows] = await (await this.database()).query(`SELECT * FROM guilduser WHERE userid = "${user}" && guildid = "${guild}"`);
        if (rows.length === 0) {
            const createUserGuild = await (await this.database()).query(`INSERT INTO guilduser (userid,guildid) VALUES ('${user}','${guild}')`);
            return createUserGuild[0];
        } else {
            return rows[0];
        }
    }

    async findUserGuild(user, guild) {
        const [rows] = await (await this.database()).query(`SELECT * FROM guilduser WHERE userid = "${user}" && guildid = "${guild}"`);
        if (rows.length === 1) {
            return rows[0];
        }
    }

    async findGuild(guild) {
        const [rows] = await (await this.database()).query(`SELECT * FROM guild WHERE id = "${guild}"`);
        if (rows.length === 1) {
            return rows[0];
        }
    }

}

module.exports = Gways;