import Client from "../../main";
import { resolve } from 'path';

class Faster {
    client: typeof Client;

    constructor(client: typeof Client) {
        this.client = client;
    }

    async clean(text: string) {
        if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
        text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203)).replace(this.client.token, "[TOKEN]");
        return text;
    }

    lang(lang: string | undefined): JSON {
        const path = resolve(__dirname, "..", "..", "..", "languages");
        const langPath = resolve(path, `${lang ?? 'en'}.json`)
        return require(langPath);
    }

}

export default Faster;