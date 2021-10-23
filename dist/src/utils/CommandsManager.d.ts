import type Client from '../../main';
import { Collection } from "discord.js";
import Command from "./Command";
declare class CommandManager {
    private _client;
    private _commands;
    private _path;
    private _slashCommands;
    constructor(client: typeof Client);
    get commands(): Collection<string, Command>;
    addCommand(command: Command): void;
    findCommand(name: string): Command | undefined;
    loadCommands(): Promise<void>;
}
export default CommandManager;
