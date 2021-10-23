"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(title) {
        this.title = title;
        this._types = {
            log: "\x1b[37m",
            info: "\x1b[34m",
            success: "\x1b[32m",
            debug: "\x1b[35m",
            warn: "\x1b[33m",
            error: "\x1b[31m"
        },
            this._originalConsole = Object.assign({}, console);
        this._init();
    }
    _init() {
        for (const [type, color] of Object.entries(this._types)) {
            this[type] = (...content) => {
                this._originalConsole.log("\x1b[40m", this._getDate(), color, `[${this.title}]`, ...content, "\x1b[0m");
            };
            console[type] = (...content) => {
                this[type](...content);
            };
        }
    }
    log(...content) { }
    info(...content) { }
    success(...content) { }
    debug(...content) { }
    warn(...content) { }
    error(...content) { }
    _getDate() {
        return `[${new Date(Date.now()).toLocaleString("FR-fr", { timeZone: "Europe/Paris" })}]`;
    }
}
exports.default = Logger;
