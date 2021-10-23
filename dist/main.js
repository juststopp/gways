"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const EventsManager_js_1 = __importDefault(require("./src/utils/EventsManager.js"));
const Faster_js_1 = __importDefault(require("./src/utils/Faster.js"));
const Logger_1 = __importDefault(require("./src/utils/Logger"));
const GiveawayManager_1 = __importDefault(require("./src/utils/GiveawayManager"));
const config = __importStar(require("./config.json"));
const mysql2_1 = require("mysql2");
class Bot extends discord_js_1.Client {
    constructor() {
        var _a, _b, _c;
        super({
            intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
            makeCache: discord_js_1.Options.cacheWithLimits({
                MessageManager: {
                    sweepInterval: 300,
                    sweepFilter: discord_js_1.LimitedCollection.filterByLifetime({
                        lifetime: 900,
                        getComparisonTimestamp: e => { var _a; return (_a = e === null || e === void 0 ? void 0 : e.editedTimestamp) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.createdTimestamp; },
                    })
                },
                ThreadManager: {
                    sweepInterval: 3600,
                    sweepFilter: discord_js_1.LimitedCollection.filterByLifetime({
                        getComparisonTimestamp: e => e.archiveTimestamp,
                        excludeFromSweep: e => !e.archived,
                    }),
                }
            })
        });
        this.config = config;
        this.logger = new Logger_1.default(`Shard#${(_c = (_b = (_a = this.shard) === null || _a === void 0 ? void 0 : _a.ids) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : "0"}`);
        this.events = new EventsManager_js_1.default(this);
        this.faster = new Faster_js_1.default(this);
        this.giveaways = new GiveawayManager_1.default(this);
        this.db = (0, mysql2_1.createPool)(this.config.mysql);
        this.launch();
    }
    launch() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.events.loadEvents();
            this.logger.success(`[Events] ${(_a = this.events) === null || _a === void 0 ? void 0 : _a.events.size} évènements ont été chargés.`);
            try {
                this.login(this.config.bot.token);
                this.logger.success(`Le WebSocket a correctement été établie avec Discord.`);
            }
            catch (err) {
                this.logger.error(`Une erreur est apparue lors du lancement du bot: ${err}`);
                return process.exit(1);
            }
        });
    }
}
exports.default = new Bot();
