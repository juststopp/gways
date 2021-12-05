import { Document, Schema, model } from 'mongoose';

export interface IEntry extends Document {
    giveaway_id: string;
    id: string;    
}

const EntrySchema = new Schema<IEntry>({
    giveaway_id: { type: String, required: true },
    id: { type: String, required: true }
})

export const EntryModel = model<IEntry>('Entry', EntrySchema);