import type Client from '../../main';
declare abstract class DiscordEvent {
    _client: typeof Client;
    _name: string;
    constructor(client: typeof Client, name: string);
    abstract run(...args: any[]): void;
}
export default DiscordEvent;
