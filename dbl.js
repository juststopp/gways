exports.run = async (client) => {
    const DBL = require('dblapi.js');
    const stats = new DBL(client.config.dbltoken, client);

    setInterval(() => {
        stats.postStats(client.guilds.size);
    }, 1800000);

    if (client.shard.ids.includes(0) && !client.spawned) {
        const dbl = new DBL(client.config.dbltoken, { webhookPort: 7000, webhookAuth: 'password' });

        dbl.webhook.on('ready', hook => {
            console.log(`\x1b[32m[TOP.GG]\x1b[0m Webhook running at \x1b[36mhttp://${hook.hostname}:${hook.port}${hook.path}\x1b[0m.`)
        });

        dbl.webhook.on("vote", async (vote) => {

            let [voted] = await (await client.database()).query(`SELECT * FROM votes WHERE id = "${vote.user}"`);
            if(!voted[0]) {
                await (await client.database()).query(`INSERT INTO votes (id) VALUES("${vote.user}")`)
            }
            [voted] = await (await client.database()).query(`SELECT * FROM votes WHERE id = "${vote.user}"`);
            await (await client.database()).query(`UPDATE votes SET votes = "${voted[0].votes + 1}" WHERE id = "${vote.user}"`)

            await client.shard.broadcastEval(`let channel = this.channels.cache.get("760095209287319552"); if(channel) { 
                channel.send("<@${vote.user}> just voted for the bot *(\`${voted[0].votes + 1} vote${(voted[0].votes + 1) > 1 ? 's' : ''}\`)*! Thanks : https://top.gg/bot/746404171783340164/vote :heart:")  
            }`);
        });
    }
};

