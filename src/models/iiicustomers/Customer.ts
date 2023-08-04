import mongoose, { Document, Schema } from "mongoose";
import { ICustomer } from "../../interfaces/iiicustomers/Customer";

const CustomerSchema: Schema = new Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  businessName: { type: String, required: false },
  address: { type: String, required: false },
  phone: { type: String, required: false },
  fax: { type: String, required: false },
  storage: { type: Number, required: false },
  archived: { type: Boolean, required: false, default: false },
  estimatedWealth: { type: String, required: true },
  amountSwindled: { type: String, required: true },
  perceivedPriority: { type: Number, required: true },
});

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
