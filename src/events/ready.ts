import type Client from '../../main';
import DiscordEvent from '../utils/DiscordEvent';
import CommandsManager from "../utils/CommandsManager";

class Ready extends DiscordEvent {
    _client: typeof Client;
    constructor(client: typeof Client) {
        super(client, "ready");
        this._client = client;
    }

    async run() {
        this._client.user.setStatus("idle");
        this._client.commands = new CommandsManager(this._client);

        this._client.commands.loadCommands().then(() => {
            this._client.logger.success(`[Commandes] ${this._client.commands?.commands.size} commandes ont été chargées.`);
                this._client.logger.success('Tout a correctement été lancé.')
        }).catch(err => {
            console.log(err)
            this._client.logger.error(`Une erreur est apparue lors du chargement des commandes: ${err}`);
        })
    }
}

module.exports = Ready;