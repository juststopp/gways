"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Context {
    constructor(client, interaction, guildDatas) {
        var _a;
        this.interaction = interaction;
        this.client = client;
        this.args = interaction.options;
        this.datas = guildDatas;
        this.lang = this.client.faster.lang((_a = this.datas[0]) === null || _a === void 0 ? void 0 : _a.lang);
    }
    get shards() {
        var _a;
        if (!((_a = this.client) === null || _a === void 0 ? void 0 : _a.shard))
            throw new Error("Shard introuvable");
        return this.client.shard;
    }
    get guild() {
        if (!this.interaction.guild)
            throw new Error("Serveur introuvable");
        return this.interaction.guild;
    }
    get channel() {
        if (!this.interaction.channel || !this.interaction.guild)
            throw new Error("Salon de serveur introuvable.");
        if (!(this.interaction.channel instanceof discord_js_1.GuildChannel) && !(this.interaction.channel instanceof discord_js_1.ThreadChannel))
            throw new Error("Salon introuvable.");
        return this.interaction.channel;
    }
    get author() {
        return this.interaction.user;
    }
    get member() {
        return this.interaction.member;
    }
    get me() {
        return this.guild.me;
    }
    reply(content) {
        return this.interaction.reply(content);
    }
    deferReply(options) {
        this.interaction.deferReply(options);
    }
    followUp(content) {
        return this.interaction.followUp(content);
    }
    editReply(content) {
        return this.interaction.editReply(content);
    }
    deleteReply() {
        return this.interaction.deleteReply();
    }
}
exports.default = Context;
