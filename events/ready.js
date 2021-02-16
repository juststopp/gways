module.exports = class {

    constructor(client) {
        this.client = client;
    }

    async run() {
        this.client.user.setActivity(`V3.5 - g.help`)
        this.client.channels.cache.get('801467866436075560').setName(`🤖・${this.client.guilds.cache.size}/600`)
        setInterval(() => {
            this.client.user.setActivity(`V3.5 - g.help`)
        }, 900000);
        console.log(`\x1b[36m[INFO]\x1b[0m Connecté sur \x1b[31m${this.client.user.username}\x1b[0m#\x1b[31m${this.client.user.discriminator}\x1b[0m / Identifiant : \x1b[33m${this.client.user.id}\x1b[0m / Créé le : \x1b[32m${this.client.user.createdAt}\x1b[0m`);
    };
}
