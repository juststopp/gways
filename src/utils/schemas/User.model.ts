import { Snowflake } from 'discord.js';
import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    id: Snowflake;
    notifs: string;
}

const UserSchema = new Schema<IUser>({
    id: { type: String, required: true },
    notifs: { type: String, required: true, default: 'on' }
})

export const UserModel = model<IUser>('User', UserSchema);