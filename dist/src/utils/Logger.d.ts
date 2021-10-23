declare global {
    interface Console {
        success(...args: any): void;
    }
}
declare class Logger {
    title: string;
    private _types;
    private _originalConsole;
    constructor(title: string);
    private _init;
    log(...content: any[]): void;
    info(...content: any[]): void;
    success(...content: any[]): void;
    debug(...content: any[]): void;
    warn(...content: any[]): void;
    error(...content: any[]): void;
    private _getDate;
}
export default Logger;
