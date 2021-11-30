import Client from "../../main";
import { resolve } from 'path';
import { Guild } from 'discord.js';
import axios from 'axios';

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
        const langPath = resolve(path, `${lang}.json`)
        return require(langPath);
    }

    checkLinks(args: Array<string>) {
        return new Promise((resolve, reject) => {
            args.forEach((arg: string) => {
                if(arg.toLowerCase() !== 'no') {

                    axios.get('https://discord.com/api/v6/invites/' + arg.trim().split('/')[3], {
                        headers: {
                            "User-Agent": "DiscordBot",
                            "Content-Type": "application/json",
                            "Authorization": "Bot " + this.client.config.token
                        }
                    }).then(async(res) => {

                        // @ts-ignore;
                        const servers: Collection<Snowflake, Guild> = await this.client.shard.broadcastEval((client: typeof Client, { guildId }) => client.guilds.cache.get(guildId), { context: { guildId: res.data.guild.id } });
                        if(!servers || !servers.find((s: any) => s?.id === res.data.guild.id)) reject(`I'm not in this guild: ${arg}`);

                        resolve('Done!');
                    }).catch(err => {
                        reject(`This link does not exists: ${arg}`);
                    })

                }
                resolve('Done!');
            })
        })
    }

    checkRoles(args: Array<string>, guild: Guild) {
        return new Promise((resolve, reject) => {

            args.forEach((arg: string) => {
                if(arg.toLowerCase() === 'no') resolve('Done!');

                if(!guild.roles.cache.find(r => r.id === arg.trim().replace('<', '').replace('@', '').replace('&', '').replace('>', ''))) reject(`There is no role with ID \`${arg}\` in this guild.`);
                resolve('Done!');

            })

        })
    }
}

export default Faster;