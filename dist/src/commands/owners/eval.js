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
class Eval extends Command_1.default {
    constructor() {
        super({
            name: "eval",
            category: "owners",
            description: "Test a Javascript script.",
            options: [
                {
                    type: "STRING",
                    name: "script",
                    description: "The script to test.",
                    required: true,
                }
            ],
            ownerOnly: true,
            examples: ["eval ctx.client.uptime"]
        });
    }
    run(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const evaled = eval(ctx.args.getString("script"));
                const cleaned = yield ctx.client.faster.clean(evaled);
                ctx.reply({ embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle("Succès")
                            .setColor('GREEN')
                            .addField("📥 Entrée:", `\`\`\`js\n${ctx.args.getString("script")}\`\`\``)
                            .addField("📤 Résultat:", `\`\`\`js\n${cleaned}\n\`\`\``)
                    ], ephemeral: true });
            }
            catch (err) {
                ctx.reply({ embeds: [
                        new discord_js_1.MessageEmbed()
                            .setTitle("Erreur")
                            .setColor('RED')
                            .addField("📥 Entrée:", `\`\`\`js\n${ctx.args.getString("script")}\`\`\``)
                            .addField("📤 Résultat:", `\`\`\`js\n${err}\n\`\`\``)
                    ], ephemeral: true });
            }
        });
    }
}
module.exports = new Eval();
