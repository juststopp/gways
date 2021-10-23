import { Snowflake } from 'discord-api-types';
import type Client from '../../main';

class GiveawayManager {
    private _client: typeof Client;
    private _steps: Array<string>;

    constructor(client: typeof Client) {
        this._client = client;
        this._steps = ["prize", "winners", "duration"];
    }

    async giveaway(_id: Snowflake) {
        const [_g] = await this._client.db.promise().query(`SELECT * FROM giveaways WHERE id='${_id}'`);
        return _g;
    }

    get steps(): Array<string> {
        return this._steps;
    }
}

export default GiveawayManager;