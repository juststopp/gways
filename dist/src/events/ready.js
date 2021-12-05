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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiscordEvent_1 = __importDefault(require("../utils/DiscordEvent"));
const CommandsManager_1 = __importDefault(require("../utils/CommandsManager"));
class Ready extends DiscordEvent_1.default {
    constructor(client) {
        super(client, "ready");
        this._client = client;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this._client.user.setStatus("idle");
            this._client.commands = new CommandsManager_1.default(this._client);
            this._client.commands.loadCommands().then(() => {
                var _a;
                this._client.logger.success(`[Commandes] ${(_a = this._client.commands) === null || _a === void 0 ? void 0 : _a.commands.size} commandes ont été chargées.`);
                this._client.logger.success('Tout a correctement été lancé.');
            }).catch(err => {
                console.log(err);
                this._client.logger.error(`Une erreur est apparue lors du chargement des commandes: ${err}`);
            });
        });
    }
}
module.exports = Ready;
