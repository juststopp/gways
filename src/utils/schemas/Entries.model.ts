import { Document, Schema, model } from 'mongoose';

export interface IEntry extends Document {
    giveaway_id: string;
    id: string;
    entries: number;
}

const EntrySchema = new Schema<IEntry>({
    giveaway_id: { type: String, required: true },
    id: { type: String, required: true },
    entries: { type: Number, required: false, default: 0}
})

export const EntryModel = model<IEntry>('Entry', EntrySchema);