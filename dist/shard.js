"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = require("./config.json");
const Logger_1 = __importDefault(require("./src/utils/Logger"));
const managerLogger = new Logger_1.default("ShardingManager");
const manager = new discord_js_1.ShardingManager('./dist/main.js', {
    respawn: true,
    token: config_json_1.bot.token,
    totalShards: 0
});
manager.on('shardCreate', (shard) => {
    managerLogger.info(`Création de la Shard#${shard.id}`);
});
manager.spawn().then(() => {
    managerLogger.success(`Toutes les shards ont été lancées.`);
}).catch(err => {
    managerLogger.error(`Une erreur est apparue lors du lancement des shards: ${err}`);
});
