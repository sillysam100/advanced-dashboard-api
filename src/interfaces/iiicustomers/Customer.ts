import mongoose from "mongoose";

export interface ICustomer extends Document {
  _id?: mongoose.Schema.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  address?: string;
  phone?: string;
  fax?: string;
  storage?: number;
  archived?: boolean;
  estimatedWealth?: string;
  amountSwindled?: string;
  perceivedPriority?: number;
}
