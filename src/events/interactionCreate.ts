import type { Interaction } from "discord.js";
import type Client from "../../main";
import CommandHandler from "../handlers/CommandHandler";
import DiscordEvent from "../utils/DiscordEvent";

class InteractionCreate extends DiscordEvent {
    commands: CommandHandler;
    constructor(client: typeof Client) {
        super(client, "interactionCreate");
        this._client = client;
        this.commands = new CommandHandler(this._client);
    }

    async run(interaction: Interaction) {
        if(interaction.isCommand()) await this.commands.handle(interaction);
    }
}

module.exports = InteractionCreate;