const { ShardingManager } = require('discord.js');
const Statcord = require("statcord.js");
const config = require("./config");
const manager = new ShardingManager('./gways.js', { token: config.token, totalShards: config.shard });

const statcord = new Statcord.ShardingClient({
    key: "statcord.com-V75SCqYq01oX2Y9MEVyh",
    manager,
    postCpuStatistics: true, /* Whether to post CPU statistics or not, defaults to true */
    postMemStatistics: true, /* Whether to post memory statistics or not, defaults to true */
    postNetworkStatistics: true, /* Whether to post memory statistics or not, defaults to true */
    autopost: true /* Whether to auto post or not, defaults to true */
});

manager.spawn();
manager.on('shardCreate', shard => {
    console.log(`\x1b[33m[SHARD]\x1b[0m\x1b[0m Shard\x1b[35m ${shard.id}\x1b[0m is ready !`)
});

statcord.on("autopost-start", () => {
    console.log(`\x1b[33m[STATCORD]\x1b[0m\x1b[0m Started autopost !`)
});