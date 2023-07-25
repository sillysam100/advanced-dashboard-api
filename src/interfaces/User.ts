import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId;
  username: string;
  password: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  comparePassword: (password: string) => Promise<boolean>;
}
