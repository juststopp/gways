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
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const discord_js_1 = require("discord.js");
const promises_1 = require("fs/promises");
class CommandManager {
    constructor(client) {
        this._client = client;
        this._commands = new discord_js_1.Collection();
        this._path = (0, path_1.resolve)(__dirname, "..", "commands");
        if (!this._client.application)
            throw new Error("Appication is null.");
        this._slashCommands = this._client.application.commands;
    }
    get commands() {
        return this._commands;
    }
    addCommand(command) {
        this._commands.set(command.name.toLowerCase(), command);
    }
    findCommand(name) {
        if (!name || typeof name !== "string")
            return undefined;
        return this._commands.find((cmd) => {
            return cmd.name.toLowerCase() === name.toLowerCase() || cmd.aliases.includes(name.toLowerCase());
        });
    }
    loadCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.access)(this._path);
            }
            catch (error) {
                return;
            }
            yield this._slashCommands.fetch();
            const categorys = yield (0, promises_1.readdir)(this._path);
            if (!categorys || categorys.length > 0) {
                for (const category of categorys) {
                    const path = (0, path_1.resolve)(this._path, category);
                    const stats = yield (0, promises_1.stat)(path);
                    if (stats.isDirectory()) {
                        const commands = yield (0, promises_1.readdir)(path);
                        if (commands && commands.length > 0) {
                            for (const command of commands) {
                                const cmdPath = (0, path_1.resolve)(path, command);
                                const cmdStats = yield (0, promises_1.stat)(cmdPath);
                                if (cmdStats.isFile() && command.endsWith(".js")) {
                                    this.addCommand(require(cmdPath));
                                }
                            }
                        }
                    }
                }
            }
            yield this._slashCommands.set(this._commands.filter(cmd => cmd.testCmd).map((cmd) => {
                return {
                    name: cmd.name,
                    description: cmd.description,
                    options: cmd.options
                };
            }), this._client.config.discord.testGuild);
            yield this._slashCommands.set(this._commands.filter(cmd => !cmd.testCmd).map(cmd => {
                return {
                    name: cmd.name,
                    description: cmd.description,
                    options: cmd.options
                };
            }));
        });
    }
}
exports.default = CommandManager;
