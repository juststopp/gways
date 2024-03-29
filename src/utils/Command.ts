import type { ApplicationCommandOptionData, ApplicationCommandType } from "discord.js";
import type Context from "./Context";

interface CommandInfo {
    name: string,
    description: string,
    category: string,
    type: ApplicationCommandType,
    options?: ApplicationCommandOptionData[],
    premium?: boolean,
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
    type: ApplicationCommandType;
    options: ApplicationCommandOptionData[];
    examples: string[];
    premium: boolean;
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
        this.type = info.type;
        this.description = info.description;
        this.options = info.options || [];
        this.examples = info.examples || [];
        this.premium = info.premium || false;
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