import { ShardingManager, Client } from 'discord.js';
import { bot } from './config.json';
import Logger from './src/utils/Logger';

const managerLogger: Logger = new Logger("ShardingManager");
const manager: ShardingManager = new ShardingManager('./dist/main.js', {
    respawn: true,
    token: bot.token,
    totalShards: 'auto'
});

manager.on('shardCreate', (shard) => {
    managerLogger.info(`Création de la Shard#${shard.id}`);
})

manager.spawn().then(() => {
    managerLogger.success(`Toutes les shards ont été lancées.`);
    manager.shards.forEach((shard) => {
        manager.broadcastEval((client: Client, { shardId }) => { client.user.setActivity(`Shard#${shardId} with ${client.guilds.cache.size} guilds on this shard!`)}, { context: { shardId: shard.id }})
    })
}).catch(err => {
    managerLogger.error(`Une erreur est apparue lors du lancement des shards: ${err}`);
})