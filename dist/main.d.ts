import { Client } from "discord.js";
import CommandsManager from "./src/utils/CommandsManager";
import EventsManager from "./src/utils/EventsManager.js";
import Faster from "./src/utils/Faster.js";
import Logger from "./src/utils/Logger";
import GiveawayManager from "./src/utils/GiveawayManager";
declare class Bot extends Client {
    config: any;
    logger: Logger;
    events: EventsManager;
    commands: CommandsManager;
    faster: Faster;
    giveaways: GiveawayManager;
    constructor();
    launch(): Promise<never>;
}
declare const _default: Bot;
export default _default;
