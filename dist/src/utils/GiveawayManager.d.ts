import { Snowflake } from 'discord-api-types';
import type Client from '../../main';
declare class GiveawayManager {
    private _client;
    private _steps;
    constructor(client: typeof Client);
    giveaway(_id: Snowflake): Promise<import("mysql2/typings/mysql/lib/protocol/packets/RowDataPacket")[] | import("mysql2/typings/mysql/lib/protocol/packets/RowDataPacket")[][] | import("mysql2/typings/mysql/lib/protocol/packets/OkPacket") | import("mysql2/typings/mysql/lib/protocol/packets/OkPacket")[] | import("mysql2/typings/mysql/lib/protocol/packets/ResultSetHeader")>;
    get steps(): Array<string>;
}
export default GiveawayManager;
