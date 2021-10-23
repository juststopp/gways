import type { ApplicationCommandOptionData } from "discord.js";
import type Context from "./Context";
interface CommandInfo {
    name: string;
    description: string;
    category: string;
    options?: ApplicationCommandOptionData[];
    aliases?: string[];
    examples?: string[];
    userPerms?: bigint[];
    botPerms?: bigint[];
    disabled?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    testCmd?: boolean;
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
    constructor(info: CommandInfo);
    abstract run(ctx: Context): void;
}
export {};