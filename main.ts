import { Client, Options, LimitedCollection, Intents } from "discord.js";
import CommandsManager from "./src/utils/CommandsManager";
import EventsManager from "./src/utils/EventsManager.js";
import Faster from "./src/utils/Faster.js";
import Logger from "./src/utils/Logger";
import GiveawayManager from "./src/utils/GiveawayManager";
import TimersManager from "./src/utils/TimersManager";
import * as config from "./config.json";
import { connect } from "mongoose";

class Bot extends Client {
    config: any;
    logger: Logger;
    events: EventsManager;
    commands: CommandsManager;
    faster: Faster;
    giveaways: GiveawayManager;
    timers: TimersManager;

    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
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
        this.timers = new TimersManager(this);

        this.launch();
    }

    async launch() {
        await this.events.loadEvents();
        await connect('mongodb+srv://juststop:devpassword@cluster0.ho9il.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
        this.logger.success(`[Events] ${this.events?.events.size} évènements ont été chargés.`);

        try { 
            this.login(this.config.bot.token);
            this.logger.success(`Le WebSocket a correctement été établie avec Discord.`);
            this.timers.ending();
        } catch(err) {
            this.logger.error(`Une erreur est apparue lors du lancement du bot: ${err}`);
            return process.exit(1);
        }
    }
}

export default new Bot();