import type Client from "../../main";
import { CommandInteraction, GuildChannel, Permissions, ThreadChannel, Guild, ContextMenuInteraction } from "discord.js";
import Context from "../utils/Context";
import { GuildModel, IGuild } from '../utils/schemas/Guild.model';

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
        if(!command) return;

        if(command.ownerOnly && !this.client.config.bot.owners.includes(interaction.user.id)) return interaction.reply({content: ":x: **|** This command is reserved to my creators.", ephemeral: true});
        if(command.userPerms.length > 0 && !command.userPerms.some(p => guild.members.cache.get(interaction.user.id).permissions.has(p))) return interaction.reply({content: `:x: **|** You must have one of the following permissions to use this command.\n- \`${new Permissions(command.userPerms).toArray().join("`,\n- `")}\``, ephemeral: true})
        if(!guild.me.permissions.has("EMBED_LINKS") || !channelBotPerms.has("EMBED_LINKS")) return interaction.reply({content: ":x: **|** I must have the `EMBED_LINKS` permissions to work properly.", ephemeral: true});
        if(command.botPerms.length > 0 && !command.botPerms.every(p => guild.me.permissions.has(p) && channelBotPerms.has(p))) return interaction.reply({content: `:x: **|** I must have the following permissions to work properly.\n- \`${new Permissions(command.botPerms).toArray().join("`,\n- `")}\``, ephemeral: true});
        if(command.disabled && !this.client.config.bot.owners.includes(interaction.user.id)) return interaction.reply({content: ":x: **|** This command has temporarly been disabled.", ephemeral: true});

        const guildDatas: IGuild = await GuildModel.findOne({ id: guild.id }).then(g => g || GuildModel.create({ id: guild.id }));
        const ctx = new Context(this.client, interaction, guildDatas);

        try {
            await command.run(ctx);
            this.client.logger.info(`La commande ${command.name} a été effectuée par ${ctx.member.user.username} sur le serveur ${ctx.guild.name}`);
        } catch(err) {
            interaction.reply({content: ":x: **|** Sorry, an internal error occured while attempting to perform this command. Please, try again later.", ephemeral: true})
            this.client.logger.error(err);
        }
    }
}

export default CommandHandler;