const { S_IFBLK } = require("constants");
const Command = require("../../base/Command.js"),
    Discord = require("discord.js");
class blacklist extends Command {

    constructor(client) {
        super(client, {
            name: "blacklist",
        });
    }

    async run(message, args, data, language) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.youneedperm))
        if(!args[0]) {
            const [blacklist] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`);
            let array = [];
            for(let i=0; i < blacklist.length ; i++){ array.push(blacklist[i].userid); }
            return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((array.length >= 1 ? (language.blacklist.list).replace('{blusers}', '<@'+array.join('>, <@')+'>') : language.blacklist.nobody)))
        }
        if(args[0] != 'add' && args[0] != 'remove' && args[0] != 'list') return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.blacklist.argsmissing.first));
        if(args[0] == 'add'){
            if(!args[1]) return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.blacklist.argsmissing.second));
            let [blacklist] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`), user, array = [], users = args.slice(1);
            for(let arg of users){ 
                user = message.guild.members.cache.get(arg);
                if(user) {
                    for(let i=0; i < blacklist.length ; i++){ array.push(blacklist[i].userid); }
                    if(!array.includes(user.id) && !user.bot) await( await this.client.database()).query(`INSERT INTO blacklist (id, userid) VALUES('${message.guild.id}', '${user.id}')`);
                }
            }
            setTimeout(async() => {
                const [bl] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`);
                let array = [];
                for(let i=0; i < bl.length ; i++){ array.push(bl[i].userid) }
                return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((array.length >= 1 ? (language.blacklist.list).replace('{blusers}', '<@'+array.join('>, <@')+'>') : language.blacklist.nobody)))
            }, 500)
        } else if(args[0] == 'remove') {
            if(!args[1]) return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed(language.blacklist.argsmissing.second));
            let [blacklist] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`), user, array = [], users = args.slice(1);
            for(let arg of users){ 
                user = message.guild.members.cache.get(arg);
                if(user) {
                    for(let i=0; i < blacklist.length ; i++){ array.push(blacklist[i].userid); }
                    if(array.includes(user.id) && !user.bot) await( await this.client.database()).query(`DELETE FROM blacklist WHERE userid='${user.id}'`);
                }
            }
            setTimeout(async() => {
                const [bl] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`);
                let array = [];
                for(let i=0; i < bl.length ; i++){ array.push(bl[i].userid) }
                return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((array.length >= 1 ? (language.blacklist.list).replace('{blusers}', '<@'+array.join('>, <@')+'>') : language.blacklist.nobody)))
            }, 500)
        } else if(args[0] == 'list') {
            const [blacklist] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${message.guild.id}"`);
            let array = [];
            for(let i=0; i < blacklist.length ; i++){ array.push(blacklist[i].userid); }
            return message.channel.send(this.client.globalManager.generateGlobalSystemEmbed((array.length >= 1 ? (language.blacklist.list).replace('{blusers}', '<@'+array.join('>, <@')+'>') : language.blacklist.nobody)))
        }
    }
}

module.exports = blacklist;