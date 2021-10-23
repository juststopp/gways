"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiscordEvent {
    constructor(client, name) {
        if (this.constructor === DiscordEvent)
            throw new Error("Event class is an abstract Class");
        this._client = client;
        this._name = name;
    }
}
exports.default = DiscordEvent;
