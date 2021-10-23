import { Client, Intents, Options, LimitedCollection } from "discord.js";
import CommandsManager from "./src/utils/CommandsManager";
import EventsManager from "./src/utils/EventsManager.js";
import Faster from "./src/utils/Faster.js";
import Logger from "./src/utils/Logger";
import GiveawayManager from "./src/utils/GiveawayManager";
import * as config from "./config.json";
import { Pool, createPool } from "mysql2";

class Bot extends Client {
    config: any;
    logger: Logger;
    events: EventsManager;
    commands: CommandsManager;
    faster: Faster;
    db: Pool;
    giveaways: GiveawayManager;

    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
            makeCache: Options.cacheWithLimits({
                MessageManager: {
                    sweepInterval: 300,
                    sweepFilter: LimitedCollection.filterByLifetime({
                        lifetime: 900,
                        getComparisonTimestamp: e => e?.editedTimestamp ?? e?.createdTimestamp,
                    })
                },
                ThreadManager: {
                    sweepInterval: 3600,
                    sweepFilter: LimitedCollection.filterByLifetime({
                        getComparisonTimestamp: e => e.archiveTimestamp,
                        excludeFromSweep: e => !e.archived,
                    }),
                }
            })
        });

        this.config = config;
        this.logger = new Logger(`Shard#${this.shard?.ids?.toString() ?? "0"}`);
        this.events = new EventsManager(this);
        this.faster = new Faster(this);
        this.giveaways = new GiveawayManager(this);
        this.db = createPool(this.config.mysql);

        this.launch();
    }

    async launch() {
        await this.events.loadEvents();
        this.logger.success(`[Events] ${this.events?.events.size} évènements ont été chargés.`)

        try { 
            this.login(this.config.bot.token);
            this.logger.success(`Le WebSocket a correctement été établie avec Discord.`)
        } catch(err) {
            this.logger.error(`Une erreur est apparue lors du lancement du bot: ${err}`);
            return process.exit(1);
        }
    }
}

export default new Bot();