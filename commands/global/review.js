const Command = require("../../base/Command.js"), Discord = require("discord.js");

class review extends Command {

    constructor(client) {
        super(client, {
            name: "review",
        });
    }

    async run(message, args, data, language) {
        const msg = await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.dm)).catch(err => { return message.channel.send(this.client.globalManager.generateGlobalEmbedError(language.enabledm))})
        
        const onestar = (this.client.guilds.cache.get('755087764382548168')).emojis.cache.get('808740517256757298')
        const twostar = (this.client.guilds.cache.get('755087764382548168')).emojis.cache.get('808740534030041088')
        const threestar = (this.client.guilds.cache.get('755087764382548168')).emojis.cache.get('808740546143191041')
        const fourstar = (this.client.guilds.cache.get('755087764382548168')).emojis.cache.get('808740556683083796')
        const fivestar = (this.client.guilds.cache.get('755087764382548168')).emojis.cache.get('808740566606544956')

        await msg.react(onestar)
        await msg.react(twostar)
        await msg.react(threestar)
        await msg.react(fourstar)
        await msg.react(fivestar)

        const filter = async(reaction, user) => {
            return [onestar.name, twostar.name, threestar.name, fourstar.name, fivestar.name].includes(reaction.emoji.name) && user.id === message.author.id;
        }
        msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(async (collected) => {
            const reaction = collected.first();
            var channel = message.author.dmChannel;
            if (!channel) channel = await message.author.createDM();

            const filterCustomReason = (msgReason) => msgReason.author.id === message.author.id;

            if(reaction.emoji.name === onestar.name) {
                await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.onestar))
                channel.awaitMessages(filterCustomReason, { max: 1, time: 60000, errors: ['time'] }).then((async(collected) => {
                    await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.thanks))
                    const m = await this.client.channels.cache.get('808744416608780330').send(`${onestar}, one star`, this.client.globalManager.generateGlobalSystemEmbed((language.review.new).replace('{reason}', collected.first().content).replace('{user}', message.author.tag)))
                    await m.react(onestar)
                })).catch(collected => {
                    console.log(collected)
                })
            } else if(reaction.emoji.name === twostar.name) {
                await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.twostar))
                channel.awaitMessages(filterCustomReason, { max: 1, time: 60000, errors: ['time'] }).then((async(collected) => {
                    await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.thanks))
                    const m = await this.client.channels.cache.get('808744416608780330').send(`${twostar}, two stars`, this.client.globalManager.generateGlobalSystemEmbed((language.review.new).replace('{reason}', collected.first().content).replace('{user}', message.author.tag)))
                    await m.react(twostar)
                })).catch(collected => {
                    console.log(collected)
                })
            } else if(reaction.emoji.name === threestar.name) {
                await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.threestar))
                channel.awaitMessages(filterCustomReason, { max: 1, time: 60000, errors: ['time'] }).then((async(collected) => {
                    await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.thanks))
                    const m = await this.client.channels.cache.get('808744416608780330').send(`${threestar}, three stars`, this.client.globalManager.generateGlobalSystemEmbed((language.review.new).replace('{reason}', collected.first().content).replace('{user}', message.author.tag)))
                    await m.react(threestar)
                })).catch(collected => {
                    console.log(collected)
                })
            } else if(reaction.emoji.name === fourstar.name) {
                await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.fourstar))
                channel.awaitMessages(filterCustomReason, { max: 1, time: 60000, errors: ['time'] }).then((async(collected) => {
                    await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.thanks))
                    const m = await this.client.channels.cache.get('808744416608780330').send(`${fourstar}, four stars`, this.client.globalManager.generateGlobalSystemEmbed((language.review.new).replace('{reason}', collected.first().content).replace('{user}', message.author.tag)))
                    await m.react(fourstar)
                })).catch(collected => {
                    console.log(collected)
                })
            } else if(reaction.emoji.name === fivestar.name) {
                await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.fivestar))
                channel.awaitMessages(filterCustomReason, { max: 1, time: 60000, errors: ['time'] }).then((async(collected) => {
                    await message.author.send(this.client.globalManager.generateGlobalSystemEmbed(language.review.thanks))
                    const m = await this.client.channels.cache.get('808744416608780330').send(`${fivestar}, five stars`, this.client.globalManager.generateGlobalSystemEmbed((language.review.new).replace('{reason}', collected.first().content).replace('{user}', message.author.tag)))
                    await m.react(fivestar)
                })).catch(collected => {
                    console.log(collected)
                })
            }
        })
    }
}

module.exports = review;
