import Context from '../../utils/Context';
import Command from '../../utils/Command';
import { Message, MessageEmbed, Permissions, GuildMember, TextChannel, Channel } from 'discord.js';
import { GiveawayModel, IGiveaway } from '../../utils/schemas/Giveaway.model';
import { EntryModel, IEntry } from '../../utils/schemas/Entries.model';
import { GuildModel, IGuild } from '../../utils/schemas/Guild.model';
import { IUser, UserModel } from '../../utils/schemas/User.model';

class EndCmd extends Command {
    constructor() {
        super({
            name: "end",
            category: "giveaways",
            type: "CHAT_INPUT",
            description: "End a giveaway",
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
        if(giveaway[0].ended) return ctx.reply({ content: "This giveaway has allreay been ended.", ephemeral: true });

        const entries: IEntry[] = await EntryModel.find({ giveaway_id: ID }).then(e => e);
        const winners: Array<GuildMember> = await ctx.client.giveaways.pickWinner(giveaway[0], entries, ctx.guild, giveaway[0].winners);
        const channel: Channel | undefined = ctx.guild.channels.cache.get(giveaway[0].channel);

        const g: IGuild = await GuildModel.findOne({ id: ctx.guild.id });
        const lang: any = ctx.client.faster.lang(g.lang);

        const message: Message = await ctx.channel.messages.fetch(ID);
        const embed: MessageEmbed = await ctx.client.giveaways.buildEndEmbed(giveaway[0], winners);
        const authorMember: GuildMember = await ctx.guild.members.fetch(giveaway[0].author);
        const authorDatas: IUser = await UserModel.findOne({ id: authorMember.id }).then(u => u || UserModel.create({ id: authorMember.id }))

        message.edit({ content: ":tada: **GIVEAWAY ENDED** :tada:", embeds: [embed] });

        if(winners?.length > 0) (<TextChannel>channel).send({ content: lang.congratsnew.replace('{winners}', winners.join(', ')).replace('{s}', winners.length > 1 ? 's' : '').replace('{prize}', giveaway[0].prize) });
        else (<TextChannel>channel).send({ content: lang.nowinners })

        giveaway[0].set('ended', true);
        giveaway[0].save();

        ctx.reply({ content: "Giveaway has been ended!" })

        // @ts-ignore;
        ctx.guild.channels.cache.get(g.log)?.send({ content: lang.logs.ended.replace('{prize}', giveaway[0].prize).replace('{channel}', channel).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`)});
        if(authorDatas.notifs == 'on') authorMember.send({ content: ctx.lang.notifs.ended.replace('{prize}', giveaway[0].prize).replace('{guild}', ctx.guild.name).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`)})
                    
        winners.forEach(async (u: GuildMember) => {
            const userDatas: IUser = await UserModel.findOne({ id: u.id }).then(u => u || UserModel.create({ id: u.id }));
            if(userDatas.notifs == 'on') u.send({ content: ctx.lang.notifs.win.replace('{prize}', giveaway[0].prize).replace('{guild}', ctx.guild.name).replace('{giveawayURL}', `https://discord.com/channels/${ctx.guild.id}/${giveaway[0].channel}/${giveaway[0].id}`) })
        })
    }
}

module.exports = new EndCmd();