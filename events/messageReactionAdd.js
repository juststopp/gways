module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(reaction, member) {

        if(!reaction) return;
        if(reaction.partial){
            try {
                await reaction.fetch()
            } catch(err) {
                return;
            }
        }

        if(member.bot) return;
        if(reaction.message.channel.type == 'dm') return;
        const data = {};
        const client = this.client;
        data.config = client.config;
        const database = await client.database();
        data.database = database;
        const user = await client.findOrCreateUser(member.id);
        data.user = user;
        const guild = await client.findOrCreateGuild(reaction.message.guild.id);
        data.guild = guild;
        const guilduser = await client.findOrCreateUserGuild(member.id, reaction.message.guild.id)
        data.guilduser = guilduser;
        const language = await client.functions.getLanguage(data.guild);
        data.language = language
        const [giveaway] = await data.database.query(`SELECT * FROM giveaway WHERE id = "${reaction.message.id}" && finish = "no"`)
        if (!giveaway[0]) return
        data.giveaway = giveaway[0]

        if (member.id === this.client.config.botID) return;
        await (await this.client.database()).query(`UPDATE guilduser SET valide = "yes" WHERE userid = "${member.id}" && guildid = "${reaction.message.guild.id}"`)

        //VERIFICATION CONDITIONS
        const [blacklist] = await( await this.client.database()).query(`SELECT userid FROM blacklist WHERE id="${reaction.message.guild.id}"`);
        const logchannel = await(await this.client.database()).query(`SELECT * FROM guild WHERE id='${reaction.message.guild.id}'`);
        const lc = logchannel[0][0].logid;
        let array = [];
        for(let i=0; i < blacklist.length ; i++){ array.push(blacklist[i].userid); }
        if(array.includes(member.id)) {
            console.log("BLACKLIST")
            const texte = language.react.blacklist;
            const fieldName = language.additionalfields.name;
            const fieldDesc = language.additionalfields.description;
            await this.client.shard.broadcastEval(`
                const Discord = require("discord.js");
                const valide = new Discord.MessageEmbed()
                .setTitle("Verification System :tada:")
                .setDescription("${texte}")
                .setColor("#800000")
                .setTimestamp()
                .setURL("https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot")
                .setFooter("Giveaway Bot. 🎉")
                .addField("${fieldName}", "${fieldDesc}")
                .setThumbnail("https://img.icons8.com/flat_round/64/000000/error--v1.png")
                let user =  this.users.cache.get("${member.id}"); if(user) {
                    user.send(valide)
                }`)
            const cond = (language.log.blacklist).replace('{tag}', member.tag)
            await this.client.shard.broadcastEval(`
                let channel = this.channels.cache.get("${reaction.message.channel.id}").messages.fetch("${reaction.message.id}").then(msg => {
                    msg.reactions.cache.get("🎉").users.remove("${member.id}");
                })
                let ch = this.channels.cache.get("${lc}");
                if(ch) ch.send("${cond}")
            `)
            return;
        }

        if (data.giveaway.cserverid === "0" && data.giveaway.roleid === "0" && data.giveaway.voice === "0" && data.giveaway.message === 0) {
            console.log("NO CONDITIONS")
            const texte = language.react.reactionaccepte;
            const fieldName = language.additionalfields.name;
            const fieldDesc = language.additionalfields.description;
            await this.client.shard.broadcastEval(`
                const Discord = require("discord.js");
                const valide = new Discord.MessageEmbed()
                .setTitle("Verification System :tada:")
                .setDescription("${texte}")
                .setColor("#2f3136")
                .setTimestamp()
                .setURL("https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot")
                .setFooter("Giveaway Bot. 🎉")
                .addField("${fieldName}", "${fieldDesc}")
                .setThumbnail("https://cdn.discordapp.com/attachments/543511427651207169/772932615786201088/1f381.png")
                let user =  this.users.cache.get("${member.id}"); if(user) {
                user.send(valide)
                }`)
                const cond = (language.log.conditiondone).replace('{tag}', member.tag)
                await this.client.shard.broadcastEval(`
                    let ch = this.channels.cache.get("${lc}");
                    if(ch) ch.send("${cond}")
                `)
        } else {

            //ROLE BY PASS
            const guildv = this.client.guilds.cache.get(data.guild.id);
            let role = guildv.roles.cache.get(data.guild.rolebypass);
            if(!role || role === undefined) role = "123456789" 
            const u = await guildv.members.fetch(member.id)
            const hasRole = u.roles.cache.find(r => r.id === role.id)
            if (hasRole !== undefined) {
                const texte = language.react.reactionaccepte;
                const fieldName = language.additionalfields.name;
                const fieldDesc = language.additionalfields.description;
                await this.client.shard.broadcastEval(`
                const Discord = require("discord.js");
                const valide = new Discord.MessageEmbed()
                .setTitle("Verification System :tada:")
                .setDescription("${texte}")
                .setColor("BLACK")
                .setTimestamp()
                .setURL("https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot")
                .setFooter("Giveaway Bot. 🎉")
                .addField("${fieldName}", "${fieldDesc}")
                .setThumbnail("https://cdn.discordapp.com/attachments/543511427651207169/772932615786201088/1f381.png")
                let user =  this.users.cache.get("${member.id}"); if(user) {
                user.send(valide)
                }`)
                const cond = (language.log.bypass).replace('{tag}', member.tag)
                await this.client.shard.broadcastEval(`
                    let ch = this.channels.cache.get("${lc}");
                    if(ch) ch.send("${cond}")
                `)
            } else {
                let msg = [];
                if (data.giveaway.roleid !== "0") {
                    const guild = this.client.guilds.cache.get(data.guild.id);
                    const u = guild.members.cache.get(member.id)
                    const hasRole = u.roles.cache.find(r => r.id === data.giveaway.roleid);
                    if (!hasRole) {
                        console.log("condition role !")
                        await (await this.client.database()).query(`UPDATE guilduser SET valide = "no" WHERE userid = "${member.id}" && guildid = "${data.guild.id}"`);
                        await this.client.shard.broadcastEval(`
                        let channel = this.channels.cache.get("${reaction.message.channel.id}").messages.fetch("${reaction.message.id}").then(msg => {
                            msg.reactions.cache.get("🎉").users.remove("${member.id}");
                        })`)
                        msg.push((language.react.role).replace('{role.name}', reaction.message.guild.roles.cache.get(data.giveaway.roleid).name))
                    }
                }

                if (data.giveaway.message !== 0) {
                    if (giveaway[0].message >= (data.guilduser.message + 0)) {
                        console.log("condition message !")
                        await (await this.client.database()).query(`UPDATE guilduser SET valide = "no" WHERE userid = "${member.id}" && guildid = "${data.guild.id}"`)
                        await this.client.shard.broadcastEval(`
                        let channel = this.channels.cache.get("${reaction.message.channel.id}").messages.fetch("${reaction.message.id}").then(msg => {
                            msg.reactions.cache.get("🎉").users.remove("${member.id}");
                        })`)
                        msg.push((language.react.message).replace('{message}', (giveaway[0].message - data.guilduser.message)))
                    }
                }

                if (giveaway[0].voice !== "0" && giveaway[0].voice === "1") {
                    if (data.guilduser.voice !== "1") {
                        console.log("voice")
                        await (await this.client.database()).query(`UPDATE guilduser SET valide = "no" WHERE userid = "${member.id}" && guildid = "${data.guild.id}"`)
                        await this.client.shard.broadcastEval(`
                        let channel = this.channels.cache.get("${reaction.message.channel.id}").messages.fetch("${reaction.message.id}").then(msg => {
                            msg.reactions.cache.get("🎉").users.remove("${member.id}");
                        })`)
                        msg.push((language.react.voice))
                    }
                }

                if (giveaway[0].cserverid !== "0") {
                    const guild = this.client.guilds.cache.get(giveaway[0].cserverid);
                    const members = await guild.members.fetch();
                    const isInGuild = members.find(m => m.id === member.id);
                    if (!isInGuild) {
                        console.log("condition server !")
                        await (await this.client.database()).query(`UPDATE guilduser SET valide = "no" WHERE userid = "${member.id}" && guildid = "${data.guild.id}"`)
                        await this.client.shard.broadcastEval(`
                        let channel = this.channels.cache.get("${reaction.message.channel.id}").messages.fetch("${reaction.message.id}").then(msg => {
                            msg.reactions.cache.get("🎉").users.remove("${member.id}");
                        })`)
                        var chx = guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0);
                        let invite = await chx.createInvite({
                            maxAge: 0,
                            maxUses: 0
                        }).catch(console.error);
                        msg.push((language.react.guild).replace('{guild.name}', guild.name).replace('{guild.invite}', invite))
                    }
                }

                msg=msg.join(`, `)

                setTimeout(async () => {
                    const [verifvalide] = await data.database.query(`SELECT * FROM guilduser WHERE userid = "${member.id}" && guildid = "${data.guild.id}"`)
                    
                    if (verifvalide && verifvalide[0] && verifvalide[0].valide === "no") {
                        const fieldName = language.additionalfields.name;
                        const fieldDesc = language.additionalfields.description;
                        await this.client.shard.broadcastEval(`
                        const Discord = require("discord.js");
                        const valide = new Discord.MessageEmbed()
                        .setTitle("Verification System :tada:")
                        .setDescription("${msg}")
                        .setColor("#800000")
                        .setTimestamp()
                        .setURL("https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot")
                        .setFooter("Giveaway Bot. 🎉")
                        .addField("${fieldName}", "${fieldDesc}")
                        .setThumbnail("https://img.icons8.com/flat_round/64/000000/error--v1.png")
                        let user =  this.users.cache.get("${member.id}"); if(user) {
                        user.send(valide)
                        }`)
                        const cond = (language.log.conditionundone).replace('{tag}', member.tag)
                        await this.client.shard.broadcastEval(`
                            let ch = this.channels.cache.get("${lc}");
                            if(ch) ch.send("${cond}")
                        `)
                    } else {
                        const texte = language.react.reactionaccepte;
                        const fieldName = language.additionalfields.name;
                        const fieldDesc = language.additionalfields.description;
                        await this.client.shard.broadcastEval(`
                        const Discord = require("discord.js");
                        const valide = new Discord.MessageEmbed()
                        .setTitle("Verification System :tada:")
                        .setDescription("${texte}")
                        .setColor("#2f3136")
                        .setTimestamp()
                        .setURL("https://discord.com/oauth2/authorize?client_id=746404171783340164&permissions=-1&scope=bot")
                        .setFooter("Giveaway Bot. 🎉")
                        .addField("${fieldName}", "${fieldDesc}")
                        .setThumbnail("https://cdn.discordapp.com/attachments/543511427651207169/772932615786201088/1f381.png")
                        let user =  this.users.cache.get("${member.id}"); if(user) {
                        user.send(valide)
                        }`)
                        const cond = (language.log.conditiondone).replace('{tag}', member.tag)
                        await this.client.shard.broadcastEval(`
                            let ch = this.channels.cache.get("${lc}");
                            if(ch) ch.send("${cond}")
                        `)
                    }
                }, 2000);
            }
        }
    }
}







