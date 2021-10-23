import { ShardingManager } from 'discord.js';
import { bot } from './config.json';
import Logger from './src/utils/Logger';

const managerLogger: Logger = new Logger("ShardingManager");
const manager: ShardingManager = new ShardingManager('./dist/main.js', {
    respawn: true,
    token: bot.token,
    totalShards: 0
});

manager.on('shardCreate', (shard) => {
    managerLogger.info(`Création de la Shard#${shard.id}`);
})

manager.spawn().then(() => {
    managerLogger.success(`Toutes les shards ont été lancées.`)
}).catch(err => {
    managerLogger.error(`Une erreur est apparue lors du lancement des shards: ${err}`);
})