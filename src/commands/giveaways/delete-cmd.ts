import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Message, Channel } from 'discord.js';
import { IGiveaway, GiveawayModel } from '../../utils/schemas/Giveaway.model';
import { EntryModel } from '../../utils/schemas/Entries.model';

class DeleteCMD extends Command {
    constructor() {
        super({
            name: "delete",
            category: "giveaways",
            type: "CHAT_INPUT",
            description: "Delete a giveaway",
            options: [
                {
                    type: "STRING",
                    name: "giveaway_id",
                    description: "The ID from the message of the giveaway you wan't to delete.",
                    required: true
                }
            ]
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const ID: string = ctx.interaction?.targetId || ctx.args.getString('giveaway_id');

        //@ts-ignore;
        const giveaway: IGiveaway = await GiveawayModel.findOne({ id: ID, guild: ctx.guild.id });
        if(!giveaway) return ctx.reply({ content: ctx.lang.cmds.notagiveawayembed, ephemeral: true })

        const channel: Channel = ctx.guild.channels.cache.get(giveaway.channel);
        // @ts-ignore;
        const message: Message = await channel.messages.fetch(ID).catch(err => {});
        if(!message) return ctx.reply({ content: ctx.lang.cmds.msgdeleted, ephemeral: true })

        await EntryModel.deleteMany({ giveaway_id: message.id });
        await GiveawayModel.deleteOne({ id: message.id, guild: ctx.guild.id });
        await message.delete();

        ctx.reply({ content: ctx.lang.cmds.delete, ephemeral: true })
    }
}

module.exports = new DeleteCMD();