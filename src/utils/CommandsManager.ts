import type Client from '../../main';
import { resolve } from "path";
import { Collection, ApplicationCommandManager } from "discord.js";
import { access, readdir, stat } from "fs/promises";
import Command from "./Command";

class CommandManager {
    private _client: typeof Client;
    private _commands: Collection<string, Command>;
    private _path: string;
    private _slashCommands: ApplicationCommandManager;

    constructor(client: typeof Client) {
        this._client = client;
        this._commands = new Collection();
        this._path = resolve(__dirname, "..", "commands");
        if(!this._client.application) throw new Error("Appication is null.");
        this._slashCommands = this._client.application.commands;
    }

    get commands(): Collection<string, Command> {
        return this._commands;
    }

    addCommand(command: Command): void {
        this._commands.set(command.name.toLowerCase(), command);
    }

    findCommand(name: string): Command | undefined {
        if(!name || typeof name !== "string") return undefined;
        return this._commands.find((cmd) => {
            return cmd.name.toLowerCase() === name.toLowerCase() || cmd.aliases.includes(name.toLowerCase());
        });
    }

    async loadCommands(): Promise<void> {
        try {
            await access(this._path);
        } catch (error) { return; }

        await this._slashCommands.fetch();
        const categorys = await readdir(this._path);

        if (!categorys || categorys.length > 0) {

            for (const category of categorys) {
                const path = resolve(this._path, category);
                const stats = await stat(path);

                if (stats.isDirectory()) {
                    const commands = await readdir(path);

                    if (commands && commands.length > 0) {
                        for (const command of commands) {
                            const cmdPath = resolve(path, command);
                            const cmdStats = await stat(cmdPath);

                            if (cmdStats.isFile() && command.endsWith(".js")) {
                                this.addCommand(require(cmdPath));
                            }
                        }
                    }
                }
            }
        }

        await this._slashCommands.set(this._commands.filter((cmd: Command) => !cmd.testCmd).map((cmd) => {
            if(cmd.type !== "CHAT_INPUT") return { 
                name: cmd.name, 
                type: cmd.type 
            }
            else return { 
                name: cmd.name,
                description: cmd.description,
                options: cmd.options
            }
        }));

        await this._slashCommands.set(this._commands.filter((cmd: Command) => cmd.testCmd).map((cmd) => {
            if(cmd.type !== "CHAT_INPUT") return { 
                name: cmd.name, 
                type: cmd.type 
            }
            else return { 
                name: cmd.name,
                description: cmd.description,
                options: cmd.options
            }
        }), '917677144316968960');

    }
}

export default CommandManager;