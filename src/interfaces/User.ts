import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
    password: string;
    comparePassword: (password: string) => Promise<boolean>;
}