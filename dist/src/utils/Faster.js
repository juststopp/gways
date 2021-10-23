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
const path_1 = require("path");
class Faster {
    constructor(client) {
        this.client = client;
    }
    clean(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof text !== "string")
                text = require("util").inspect(text, { depth: 1 });
            text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replace(this.client.token, "[TOKEN]");
            return text;
        });
    }
    lang(lang) {
        const path = (0, path_1.resolve)(__dirname, "..", "..", "..", "languages");
        const langPath = (0, path_1.resolve)(path, `${lang !== null && lang !== void 0 ? lang : 'en'}.json`);
        return require(langPath);
    }
}
exports.default = Faster;
