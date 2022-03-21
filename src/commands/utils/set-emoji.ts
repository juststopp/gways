import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Emoji } from 'discord.js';
import { IGuild, GuildModel } from '../../utils/schemas/Guild.model';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { Permissions } from 'discord.js';
import emojiRegex from 'emoji-regex';

class SetEmoji extends Command {
    constructor() {
        super({
            name: "setemoji",
            category: "utils",
            type: "CHAT_INPUT",
            description: "Set the reactions for the giveaways",
            options: [
                {
                    type: "STRING",
                    name: "emoji",
                    description: "The emoji you wan't to set.",
                    required: true
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
            premium: true
        })
    }

    async run(ctx: Context) {
        const emojiID: string = ctx.args.getString('emoji').trim().split(':')[2]?.replace('>', '') ?? ctx.args.getString('emoji');

        const giveaways: IGiveaway[] = await GiveawayModel.find({ guild: ctx.guild.id, ended: false }).then(g => g);
        if(giveaways.length > 0) return ctx.reply({ content: ctx.lang.cmds.setemoji.running, ephemeral: true });

        const guild: IGuild = await GuildModel.findOne({ id: ctx.guild.id }).then(g => g || GuildModel.create({ id: ctx.guild.id }));

        if(emojiID.match(emojiRegex())) {
            if(emojiID !== "🎉") ctx.reply({ content: ctx.lang.cmds.setemoji.default, ephemeral: true });
            else {
                guild.set('emote', '🎉')
                guild.save();

                ctx.reply({ content: ctx.lang.cmds.setemoji.reset, ephemeral: true });
            }
        } else {
            const emoji: Emoji = await ctx.guild.emojis.cache.get(emojiID);
            if(!emoji) return ctx.reply({ content: ctx.lang.cmds.setemoji.noemote, ephemeral: true });

            guild.set('emote', emojiID);
            guild.save();

            ctx.reply({ content: ctx.lang.cmds.setemoji.done.replace('{emoji}', emoji), ephemeral: true });
        }
    }
}

module.exports = new SetEmoji();