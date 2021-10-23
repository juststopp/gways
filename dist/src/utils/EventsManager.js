"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const path_1 = require("path");
const promises_1 = require("fs/promises");
class EventsManager {
    constructor(client) {
        this._client = client;
        this._events = new discord_js_1.Collection();
        this._path = (0, path_1.resolve)(__dirname, '..', 'events');
    }
    get events() {
        return this._events;
    }
    addEvent(event) {
        this._events.set(event._name.toLowerCase(), event);
        this._client.on(event._name, event.run.bind(event));
        delete require.cache[require.resolve(this._path + '\\' + event._name)];
    }
    loadEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, promises_1.access)(this._path);
            }
            catch (error) {
                return;
            }
            const events = yield (0, promises_1.readdir)(this._path);
            if (events && events.length > 0) {
                for (const event of events) {
                    const path = (0, path_1.resolve)(this._path, event);
                    const stats = yield (0, promises_1.stat)(path);
                    if (event !== 'Event.js' && stats.isFile() && event.endsWith('.js')) {
                        this.addEvent(new (require(path))(this._client));
                    }
                }
            }
        });
    }
}
exports.default = EventsManager;
