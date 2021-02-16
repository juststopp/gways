const { addAsync } = require('@awaitjs/express');
const express = require('express');
const path = require('path'); 
const app = addAsync(express());

exports.run = async (client) => {

    client.msToTime = function(ms){
        days = Math.floor(ms / 86400000); // 24*60*60*1000
        daysms = ms % 86400000; // 24*60*60*1000
        hours = Math.floor(daysms / 3600000); // 60*60*1000
        hoursms = ms % 3600000; // 60*60*1000
        minutes = Math.floor(hoursms / 60000); // 60*1000
        minutesms = ms % 60000; // 60*1000
        sec = Math.floor(minutesms / 1000);
      
        let str = "";
        if (days) str = str + days + (days > 1 ? " days " : " day ");
        if (hours) str = str + hours + (hours > 1 ? " hours " : " hour ");
        if (minutes) str = str + minutes + (minutes > 1 ? " minutes " : " minute ");
        if (sec) str = str + sec + (sec > 1 ? " seconds " : " second ");
      
        return str;
    }

    app.set('views', __dirname + '/views');
    app.engine("html", require("ejs").renderFile)
    app.set("view engine", "ejs")
    app.use(express.static(path.join(__dirname, '/public')));

    app.getAsync('/giveaway/:ID', async function(req, res){
        const giveawayID = req.params.ID;
        const [giveaway] = await (await client.database()).query(`SELECT * FROM giveaway WHERE id='${giveawayID}'`);
        if(!giveaway[0]) {
            res.redirect('/')
        } else if(giveaway[0]) {
            const timeLeft = giveaway[0].finish == "yes" ? "This giveaway is ended." : `${client.msToTime(giveaway[0].duration - (Date.now() - giveaway[0].datenow))}`
            const user = await client.users.fetch(giveaway[0].authorid);
            const guild = client.guilds.cache.get(giveaway[0].serverid)
            const db = await client.database();
            res.render('timer', {
                left: timeLeft,
                guild: guild,
                guildname: client.guilds.cache.get(giveaway[0].serverid) ? client.guilds.cache.get(giveaway[0].serverid).name : "Giveaway",
                guildicon: client.guilds.cache.get(giveaway[0].serverid) ? client.guilds.cache.get(giveaway[0].serverid).iconURL({format: 'png', dynamic: true}) : "Giveaway",
                prize: giveaway[0].cadeau,
                giveaway: giveaway[0],
                giveawayhost: user ? user.tag : " an unknown user..",
                client: client,
                db: db
            })
        }
    })

    app.getAsync('/guild/:guildID', async function(req, res) {
        const guildID = req.params.guildID;
        const [guildConfig] = await (await client.database()).query(`SELECT * FROM guild WHERE id='${guildID}'`);
        const [guildGiveaways] = await (await client.database()).query(`SELECT * FROM giveaway WHERE serverid='${guildID}'`)
        if(!guildConfig[0]) res.redirect('/');
        else if(guildConfig[0]) {
            const guild = client.guilds.cache.get(guildID);
            const owner = await guild.members.fetch(guild.ownerID);
            const chx = guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0);
            const invite = await chx.createInvite({
                maxAge: 0,
                maxUses: 0
            }).catch(console.error);
            res.render('guild', {
                client: client,
                guild: guild,
                config: guildConfig[0],
                giveaways: guildGiveaways,
                owner: owner.user.tag,
                invite: invite
            })
        }
    })

    app.getAsync('/guild/:guildID/giveaways', async function(req, res) {
        const guildID = req.params.guildID;
        const [guildConfig] = await (await client.database()).query(`SELECT * FROM guild WHERE id='${guildID}'`);
        const [guildGiveaways] = await (await client.database()).query(`SELECT * FROM giveaway WHERE serverid='${guildID}'`)
        if(!guildConfig[0]) res.redirect('/');
        else if(guildConfig[0]) {
            const guild = client.guilds.cache.get(guildID);
            const owner = await guild.members.fetch(guild.ownerID);
            const chx = guild.channels.cache.filter(chx => chx.type === "text").find(x => x.position === 0);
            const invite = await chx.createInvite({
                maxAge: 0,
                maxUses: 0
            }).catch(console.error);
            res.render('giveaways', {
                client: client,
                guild: guild,
                config: guildConfig[0],
                giveaways: guildGiveaways,
                owner: owner.user.tag,
                invite: invite
            })
        }
    })

    app.get('/', function(req, res) {
        res.render('index')
    })

    app.get('*', function(req, res) {
        res.send('Error 404')
    })

    app.listen(80, function() {
        console.log('Server express prêt !')
    })
}
