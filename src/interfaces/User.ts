import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId;
  username: string;
  password: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  roleId: mongoose.Schema.Types.ObjectId;
  role: string;
  comparePassword: (password: string) => Promise<boolean>;
}

export interface IUserRole extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  actions: string[];
}
