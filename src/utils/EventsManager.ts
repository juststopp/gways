import type Client from '../../main';
import { Collection } from 'discord.js';
import { resolve } from 'path';
import type DiscordEvent from './DiscordEvent';
import { access, readdir, stat } from 'fs/promises';

class EventsManager {
    private _client: typeof Client;
    private _events: Collection<string, DiscordEvent>;
    private _path: string;

    constructor(client: typeof Client) {
        this._client = client;
        this._events = new Collection();
        this._path = resolve(__dirname, '..', 'events');
    }

    get events(): Collection<string, DiscordEvent> {
        return this._events;
    }

    addEvent(event: DiscordEvent): void {
        this._events.set(event._name.toLowerCase(), event);
        this._client.on(event._name, event.run.bind(event));
        delete require.cache[require.resolve(this._path + '\\' + event._name)];
    }

    async loadEvents(): Promise<void> {
        try {
            await access(this._path);
        } catch(error) { return; }

        const events = await readdir(this._path);
        if(events && events.length > 0) {
            for(const event of events) {
                const path = resolve(this._path, event);
                const stats = await stat(path);

                if(event !== 'Event.js' && stats.isFile() && event.endsWith('.js')) {
                    this.addEvent(new(require(path))(this._client));
                }
            }
        }
    }
}

export default EventsManager;