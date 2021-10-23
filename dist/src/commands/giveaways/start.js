"use strict";
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
const Command_1 = __importDefault(require("../../utils/Command"));
const discord_js_1 = require("discord.js");
class GiveawayStart extends Command_1.default {
    constructor() {
        super({
            name: "start",
            category: "giveaways",
            description: "Start the configuration of a giveaway.",
            examples: ["start"],
            testCmd: true,
            userPerms: [discord_js_1.Permissions.FLAGS.MANAGE_GUILD],
            botPerms: [discord_js_1.Permissions.FLAGS.ADD_REACTIONS]
        });
    }
    run(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            ctx.reply({ content: "Let's create a new giveaway on this server!\n\nIn the next steps, you will have to complete some informations about the giveaway to start it. If you wan't to leave the giveaway creation process, reply to the messages below by saying `cancel`." });
            const filter = (message) => message.author.id == ctx.author.id && !message.author.bot;
            ctx.channel.send({ content: "**What do you wan't the winner(s) to won ?** - `1/4`\n\n- *To stop the giveaway creation process, just reply to this message by saying `cancel`.*" });
        });
    }
}
module.exports = new GiveawayStart();
