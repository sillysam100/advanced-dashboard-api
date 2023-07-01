import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../interfaces/User';

const UserSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId },
    username: {type: String, required: true, unique: true},
    password: {type: String, require: true}
});

UserSchema.pre<IUser>('save', async function(next) {
    if(!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

export const User = mongoose.model<IUser>('User', UserSchema);