import type Client from '../../main';

abstract class DiscordEvent {
    _client: typeof Client;
    _name: string;
    constructor(client: typeof Client, name: string) {
        if(this.constructor === DiscordEvent) throw new Error("Event class is an abstract Class");
        this._client = client;
        this._name = name;
    }

    abstract run(...args: any[]): void;
}

export default DiscordEvent;