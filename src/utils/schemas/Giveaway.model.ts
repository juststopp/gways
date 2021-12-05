import { Document, Schema, model } from 'mongoose';

export interface IGiveaway extends Document {
    id: string;
    author: string;
    channel: string;
    guild: string;
    prize: string;
    winners: number;
    conditions: Map<string, string>;
    end: string;
    ended: boolean;
}

const GiveawaySchema = new Schema<IGiveaway>({
    id: { type: String, required: true },
    author: { type: String, required: true },
    channel: { type: String, required: true },
    guild: { type: String, required: true },
    prize: { type: String, required: true },
    winners: { type: Number, required: true },
    conditions: { type: Map, required: true },
    end: { type: String, required: true },
    ended: { type: Boolean, required: true }
})

export const GiveawayModel = model<IGiveaway>('Giveaway', GiveawaySchema);