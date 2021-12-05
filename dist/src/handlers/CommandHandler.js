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
const discord_js_1 = require("discord.js");
const Context_1 = __importDefault(require("../utils/Context"));
const Guild_model_1 = require("../utils/schemas/Guild.model");
class CommandHandler {
    constructor(client) {
        this.client = client;
    }
    handle(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (interaction.user.bot || !interaction.inGuild())
                return;
            const guild = interaction.guild;
            if (!(interaction.channel instanceof discord_js_1.GuildChannel) && !(interaction.channel instanceof discord_js_1.ThreadChannel))
                throw new Error("Salon introuvable.");
            const channelBotPerms = new discord_js_1.Permissions((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.permissionsFor(guild.me));
            const command = this.client.commands.findCommand(interaction.commandName);
            if (!command)
                return;
            if (command.ownerOnly && !this.client.config.bot.owners.includes(interaction.user.id))
                return interaction.reply({ content: ":x: **|** This command is reserved to my creators.", ephemeral: true });
            if (command.userPerms.length > 0 && !command.userPerms.some(p => guild.members.cache.get(interaction.user.id).permissions.has(p)))
                return interaction.reply({ content: `:x: **|** You must have one of the following permissions to use this command.\n- \`${new discord_js_1.Permissions(command.userPerms).toArray().join("`,\n- `")}\``, ephemeral: true });
            if (!guild.me.permissions.has("EMBED_LINKS") || !channelBotPerms.has("EMBED_LINKS"))
                return interaction.reply({ content: ":x: **|** I must have the `EMBED_LINKS` permissions to work properly.", ephemeral: true });
            if (command.botPerms.length > 0 && !command.botPerms.every(p => guild.me.permissions.has(p) && channelBotPerms.has(p)))
                return interaction.reply({ content: `:x: **|** I must have the following permissions to work properly.\n- \`${new discord_js_1.Permissions(command.botPerms).toArray().join("`,\n- `")}\``, ephemeral: true });
            if (command.disabled && !this.client.config.bot.owners.includes(interaction.user.id))
                return interaction.reply({ content: ":x: **|** This command has temporarly been disabled.", ephemeral: true });
            const guildDatas = yield Guild_model_1.GuildModel.findOne({ id: guild.id }).then(g => g || Guild_model_1.GuildModel.create({ id: guild.id }));
            const ctx = new Context_1.default(this.client, interaction, guildDatas);
            try {
                yield command.run(ctx);
                this.client.logger.info(`La commande ${command.name} a été effectuée par ${ctx.member.user.username} sur le serveur ${ctx.guild.name}`);
            }
            catch (err) {
                interaction.reply({ content: ":x: **|** Sorry, an internal error occured while attempting to perform this command. Please, try again later.", ephemeral: true });
                this.client.logger.error(err);
            }
        });
    }
}
exports.default = CommandHandler;
