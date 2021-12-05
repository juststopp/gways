import type Client from "../../main";
import { CommandInteraction, ContextMenuInteraction } from "discord.js";
declare class CommandHandler {
    client: typeof Client;
    constructor(client: typeof Client);
    handle(interaction: CommandInteraction | ContextMenuInteraction): Promise<void>;
}
export default CommandHandler;
