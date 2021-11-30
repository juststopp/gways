import { Document, Schema, model } from 'mongoose';

export interface IGuild extends Document {
    id: string;
    lang: string;    
}

const GuildSchema = new Schema<IGuild>({
    id: { type: String, required: true },
    lang: { type: String, required: true, default: 'fr' }
})

export const GuildModel = model<IGuild>('Guild', GuildSchema);