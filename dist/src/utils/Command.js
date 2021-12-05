"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(info) {
        this.name = info.name;
        this.category = info.category;
        this.type = info.type;
        this.description = info.description;
        this.options = info.options || [];
        this.examples = info.examples || [];
        this.aliases = info.aliases || [];
        this.userPerms = info.userPerms || [];
        this.botPerms = info.botPerms || [];
        this.disabled = info.disabled || false;
        this.ownerOnly = info.ownerOnly || false;
        this.guildOnly = info.guildOnly || false;
        this.testCmd = info.testCmd || false;
    }
}
exports.default = Command;
