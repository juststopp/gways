import type Client from '../../main';
import DiscordEvent from '../utils/DiscordEvent';

class Debug extends DiscordEvent {
    _client: typeof Client;
    constructor(client: typeof Client) {
        super(client, "debug");
        this._client = client;
    }

    async run(error: any) {
        this._client.logger.debug(error)
    }
}

module.exports = Debug;
