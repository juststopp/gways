import type { ApplicationCommandOptionData } from "discord.js";
import type Context from "./Context";

interface CommandInfo {
    name: string,
    description: string,
    category: string,
    options?: ApplicationCommandOptionData[],
    aliases?: string[],
    examples?: string[],
    userPerms?: bigint[],
    botPerms?: bigint[],
    disabled?: boolean,
    ownerOnly?: boolean,
    guildOnly?: boolean,
    testCmd?: boolean,
}

export default abstract class Command {
    name: string;
    description: string;
    category: string;
    options: ApplicationCommandOptionData[];
    examples: string[];
    aliases: string[];
    userPerms: bigint[];
    botPerms: bigint[];
    disabled: boolean;
    ownerOnly: boolean;
    guildOnly: boolean;
    testCmd: boolean;

    constructor(info: CommandInfo) {
        this.name = info.name;
        this.category = info.category;
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

    abstract run(ctx: Context): void;
}