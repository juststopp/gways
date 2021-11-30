import type Client from '../../main';

class GiveawayManager {
    private _client: typeof Client;

    constructor(client: typeof Client) {
        this._client = client;
    }
}

export default GiveawayManager;