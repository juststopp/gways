import { Snowflake } from 'discord.js';
import { Document, Schema, model } from 'mongoose';

export interface IGuild extends Document {
    id: string;
    lang: string;
    bypassroles: string;
    emote: string;
    premium: number;
    log: Snowflake;
    managers: string;
    blacklist: string;
}

const GuildSchema = new Schema<IGuild>({
    id: { type: String, required: true },
    lang: { type: String, required: true, default: 'en' },
    bypassroles: { type: String, required: true, default: "none" },
    emote: { type: String, required: true, default: '🎉' },
    premium: { type: Number, required: true, default: 0 },
    log: { type: String, required: true, default: "none"},
    managers: { type: String, required: true, default: "none"},
    blacklist: { type: String, required: true, default: "none" }
})

export const GuildModel = model<IGuild>('Guild', GuildSchema);
