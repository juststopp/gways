import { Document, Schema, model } from 'mongoose';

export interface IMessages extends Document {
    id: string;
    guild: string;
    channel: string;
    messages: number;
}

const MessagesSchema = new Schema<IMessages>({
    id: { type: String, required: true },
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    messages: { type: Number, required: true, default: 0 },
})

export const MessagesModel = model<IMessages>('Messages', MessagesSchema);