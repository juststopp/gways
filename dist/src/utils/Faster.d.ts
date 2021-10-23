import Client from "../../main";
declare class Faster {
    client: typeof Client;
    constructor(client: typeof Client);
    clean(text: string): Promise<string>;
    lang(lang: string | undefined): JSON;
}
export default Faster;
