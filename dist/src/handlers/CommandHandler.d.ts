import type Client from "../../main";
import { CommandInteraction } from "discord.js";
declare class CommandHandler {
    client: typeof Client;
    constructor(client: typeof Client);
    handle(interaction: CommandInteraction): Promise<void>;
}
export default CommandHandler;
