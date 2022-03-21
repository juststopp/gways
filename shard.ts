import { ShardingManager, Client } from 'discord.js';
import { bot } from './config.json';
import Logger from './src/utils/Logger';
import { ShardingClient } from 'statcord.js';

const managerLogger: Logger = new Logger("ShardingManager");
const manager: ShardingManager = new ShardingManager('./dist/main.js', {
    respawn: true,
    token: bot.token,
    totalShards: bot.shards
});

const statcord: ShardingClient = new ShardingClient({
    key: "statcord.com-bkMhB9P4ijdKEiibWub9",
    manager,
    postCpuStatistics: true,
    postMemStatistics: true,
    postNetworkStatistics: true,
    autopost: true
});

manager.on('shardCreate', (shard) => {
    managerLogger.info(`Création de la Shard#${shard.id}`);
})

manager.spawn().then(() => {
    managerLogger.success(`Toutes les shards ont été lancées.`);
}).catch(err => {
    managerLogger.error(`Une erreur est apparue lors du lancement des shards: ${err}`);
})

statcord.on("autopost-start", () => {
    managerLogger.info(`Lancement de l'AUTO-POST sur Statcord.com`)
});