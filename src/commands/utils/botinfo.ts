import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { MessageEmbed } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';

class BotInfoCMD extends Command {
    constructor() {
        super({
            name: "botinfo",
            category: "informations",
            type: "CHAT_INPUT",
            description: "Get bot informations",
            options: []
        })
    }

    async run(ctx: Context) {
        const giveaways: IGiveaway[] = await GiveawayModel.find({}).then(g => g);

        ctx.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(ctx.lang.cmds.botinfo.title)
                .setColor(ctx.guild.me.displayHexColor)
                .setDescription(ctx.lang.cmds.botinfo.description.replace('{ms}', Math.floor((Date.now() - ctx.client.uptime) / 1000)).replace('{guilds}', ctx.client.guilds.cache.size).replace('{shard}', ctx.client.shard.ids).replace('{giveaways}', giveaways.length).replace('{running}', giveaways.filter(g => !g.ended).length).replace('{ended}', giveaways.filter(g => g.ended).length))
            ]
        })
    }
}

module.exports = new BotInfoCMD();