import type Client from "../../main";
import { CommandInteraction, GuildChannel, Permissions, ThreadChannel, Guild, ContextMenuInteraction } from "discord.js";
import Context from "../utils/Context";
import { GuildModel, IGuild } from '../utils/schemas/Guild.model';
import { ShardingClient } from 'statcord.js';

class CommandHandler {
    client: typeof Client;

    constructor(client: typeof Client) {
        this.client = client;
    }

    async handle(interaction: CommandInteraction | ContextMenuInteraction) {
        if(interaction.user.bot || !interaction.inGuild()) return;
        
        const guild: Guild = interaction.guild;

        if(!(interaction.channel instanceof GuildChannel) && !(interaction.channel instanceof ThreadChannel)) throw new Error("Salon introuvable.");
        const channelBotPerms = new Permissions(interaction.channel?.permissionsFor(guild.me));

        const command = this.client.commands.findCommand(interaction.commandName);
        const guildDatas: IGuild = await GuildModel.findOne({ id: guild.id }).then(g => g || GuildModel.create({ id: guild.id }));
        if(!command) return;

        const ctx = new Context(this.client, interaction, guildDatas);

        if(command.ownerOnly && !this.client.config.bot.owners.includes(interaction.user.id)) return interaction.reply({content: ctx.lang.cmds.owneronly, ephemeral: true});
        if(command.userPerms.length > 0 && !command.userPerms.some(p => guild.members.cache.get(interaction.user.id).permissions.has(p))) {
            if(command.category === 'giveaways' && !guildDatas.managers.trim().split(';').some((r: any) => guild.members.cache.get(interaction.user.id).roles.cache.has(r.replace('<', '').replace('@', '').replace('&', '').replace('>', '')))) return interaction.reply({content: ctx.lang.cmds.userPerms.replace('{perms}', new Permissions(command.userPerms).toArray().join("`,\n- `")), ephemeral: true})
            else if(command.category !== 'giveaways') return interaction.reply({content: ctx.lang.cmds.userPerms.replace('{perms}', new Permissions(command.userPerms).toArray().join("`,\n- `")), ephemeral: true})
        }
        if(!guild.me.permissions.has("EMBED_LINKS") || !channelBotPerms.has("EMBED_LINKS")) return interaction.reply({content: ctx.lang.cmds.embedPerms, ephemeral: true});
        if(command.botPerms.length > 0 && !command.botPerms.every(p => guild.me.permissions.has(p) && channelBotPerms.has(p))) return interaction.reply({content: ctx.lang.cmds.userPerms.replace('{perms}', new Permissions(command.botPerms).toArray().join("`,\n- `")), ephemeral: true});
        if(command.disabled && !this.client.config.bot.owners.includes(interaction.user.id)) return interaction.reply({content: ctx.lang.cmds.disabled, ephemeral: true});
        if(command.premium && (guildDatas.premium - Date.now() < 0)) return interaction.reply({content: ctx.lang.cmds.premiumneed, ephemeral: true});

        try {
            await command.run(ctx);
            this.client.logger.info(`La commande ${command.name} a été effectuée par ${ctx.member.user.username} sur le serveur ${ctx.guild.name}`);
            ShardingClient.postCommand(command.name, ctx.author.id, this.client)
        } catch(err) {
            interaction.reply({content: ctx.lang.cmds.error, ephemeral: true})
            this.client.logger.error(err);
        }
    }
}

export default CommandHandler;