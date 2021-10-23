import type Client from '../../main';
import { Collection } from 'discord.js';
import type DiscordEvent from './DiscordEvent';
declare class EventsManager {
    private _client;
    private _events;
    private _path;
    constructor(client: typeof Client);
    get events(): Collection<string, DiscordEvent>;
    addEvent(event: DiscordEvent): void;
    loadEvents(): Promise<void>;
}
export default EventsManager;
