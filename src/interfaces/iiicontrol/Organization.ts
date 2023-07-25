import mongoose from "mongoose";

export interface IOrganization extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
}
