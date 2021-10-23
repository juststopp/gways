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
class GiveawayManager {
    constructor(client) {
        this._client = client;
        this._steps = ["prize", "winners", "duration"];
    }
    giveaway(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const [_g] = yield this._client.db.promise().query(`SELECT * FROM giveaways WHERE id='${_id}'`);
            return _g;
        });
    }
    get steps() {
        return this._steps;
    }
}
exports.default = GiveawayManager;
