import Command from '../../utils/Command';
import Context from '../../utils/Context';
import { MessageEmbed } from 'discord.js';

class Eval extends Command {
    constructor() {
        super({
            name: "eval",
            category: "owners",
            description: "Test a Javascript script.",
            type: "CHAT_INPUT",
            options: [
                {
                    type: "STRING",
                    name: "script",
                    description: "The script to test.",
                    required: true,
                }
            ],
            ownerOnly: true,
            examples: ["eval ctx.client.uptime"]
        })
    }

    async run(ctx: Context) {
        try {
            const evaled = eval(ctx.args.getString("script"));
            const cleaned = await ctx.client.faster.clean(evaled);
            ctx.reply({embeds: [
                new MessageEmbed()
                .setTitle("Succès")
                .setColor('GREEN')
                .addField("📥 Entrée:", `\`\`\`js\n${ctx.args.getString("script")}\`\`\``)
                .addField("📤 Résultat:", `\`\`\`js\n${cleaned}\n\`\`\``)
            ]});
        } catch(err) {
            ctx.reply({embeds: [
                new MessageEmbed()
                .setTitle("Erreur")
                .setColor('RED')
                .addField("📥 Entrée:", `\`\`\`js\n${ctx.args.getString("script")}\`\`\``)
                .addField("📤 Résultat:", `\`\`\`js\n${err}\n\`\`\``)
            ]});
        }
    }
}

module.exports = new Eval();