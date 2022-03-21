import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Message, MessageEmbed, Permissions, GuildMember, Channel, TextChannel } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { EntryModel, IEntry } from '../../utils/schemas/Entries.model';
import { IUser, UserModel } from '../../utils/schemas/User.model';

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
                },
                {
                    type: "NUMBER",
                    name: "winners",
                    description: "The number of winners to reroll",
                    required: false
                }
            ],
            userPerms: [Permissions.FLAGS.MANAGE_GUILD],
        })
    }

    async run(ctx: Context) {
        // @ts-ignore;
        const ID: string = ctx.interaction?.targetId || ctx.args.getString('giveaway_id');
        // @ts-ignore;
        const giveaway: IGiveaway[] = await GiveawayModel.find({ id: ID, guild: ctx.guild.id }).then(g => g);

        if(!giveaway[0]) return ctx.reply({ content: ctx.lang.cmds.notagiveawayembed, ephemeral: true });        
        if(!giveaway[0].ended) return ctx.reply({ content: ctx.lang.cmds.reroll.notended, ephemeral: true });

        const entries: IEntry[] = await EntryModel.find({ giveaway_id: ID }).then(e => e);
        const winners: Array<GuildMember> = await ctx.client.giveaways.pickWinner(giveaway[0], entries, ctx.guild, ctx.args.getNumber('winners') >= 1 ? ctx.args.getNumber('winners') : giveaway[0].winners);

        const channel: Channel = await ctx.guild.channels.cache.get(giveaway[0].channel);
        const authorMember: GuildMember = await ctx.guild.members.fetch(giveaway[0].author);
        const authorDatas: IUser = await UserModel.findOne({ id: authorMember.id }).then(u => u || UserModel.create({ id: authorMember.id }));

        // @ts-ignore;
        const message: Message = await channel.messages.fetch(ID);
        const embed: MessageEmbed = await ctx.client.giveaways.buildEndEmbed(giveaway[0], winners);

        message.edit({ content: ctx.lang.ended, embeds: [embed] });

        if(winners?.length > 0) (<TextChannel>channel).send({ content: ctx.lang.congratsnew.replace('{winners}', winners.join(', ')).replace('{s}', winners.length > 1 ? 's' : '').replace('{prize}', giveaway[0].prize) });
        else (<TextChannel>channel).send({ content: ctx.lang.nowinners})

        ctx.reply({ content: ctx.lang.cmds.reroll.rerolled, ephemeral: true })
        if(authorDatas.notifs == 'on') authorMember.send({ content: ctx.lang.notifs.ended.replace('{prize}', giveaway[0].prize).replace('{guild}', ctx.guild.name).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`)})
                    
        winners.forEach(async (u: GuildMember) => {
            const userDatas: IUser = await UserModel.findOne({ id: u.id }).then(u => u || UserModel.create({ id: u.id }));
            if(userDatas.notifs == 'on') u.send({ content: ctx.lang.notifs.win.replace('{prize}', giveaway[0].prize).replace('{guild}', ctx.guild.name).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`) })
        })
    }
}

module.exports = new RerollCmd();