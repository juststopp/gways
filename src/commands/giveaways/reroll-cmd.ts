import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Message, MessageEmbed, Permissions, GuildMember } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { EntryModel, IEntry } from '../../utils/schemas/Entries.model';

class RerollCmd extends Command {
    constructor() {
        super({
            name: "reroll",
            category: "giveaways",
            type: "CHAT_INPUT",
            description: "Reroll a giveaway",
            options: [
                {
                    type: "STRING",
                    name: "giveaway_id",
                    description: "The ID of the giveaway message",
                    required: true
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const ID: string = ctx.interaction?.targetId || ctx.args.getString('giveaway_id');
        // @ts-ignore;
        const giveaway: IGiveaway[] = await GiveawayModel.find({ id: ID, channel: ctx.channel.id, guild: ctx.guild.id }).then(g => g);

        if(!giveaway[0]) return ctx.reply({ content: "This message is not a giveaway embed from the bot.", ephemeral: true });        
        if(!giveaway[0].ended) return ctx.reply({ content: "You can only reroll ended giveaways.", ephemeral: true });

        const entries: IEntry[] = await EntryModel.find({ giveaway_id: ID }).then(e => e);
        const winners: Array<GuildMember> = await ctx.client.giveaways.pickWinner(giveaway[0], entries, ctx.guild);

        const message: Message = await ctx.channel.messages.fetch(ID);
        const embed: MessageEmbed = await ctx.client.giveaways.buildEndEmbed(giveaway[0], winners);

        message.edit({ content: ":tada: **GIVEAWAY ENDED** :tada:", embeds: [embed] });

        // @ts-ignore;
        if(winners?.length > 0) ctx.channel.send({ content: `:tada: Congratulations ${winners.join(', ')}, you are the new winner${winners.length > 1 ? 's' : ''} for **${giveaway[0].prize}**!` });
        // @ts-ignore;
        else ctx.channel.send({ content: ":tada: Oops, no winners can be determinated for this giveaway :-/"})

        ctx.reply({ content: "Giveaway has been rerolled!", ephemeral: true })
    }
}

module.exports = new RerollCmd();