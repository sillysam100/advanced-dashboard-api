import { Document } from "mongoose";
import mongoose from "mongoose";

export interface IRegister extends Document {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  organizationId: mongoose.Schema.Types.ObjectId;
  value: string;
  controlType: "read" | "write";
  unit: string;
}
