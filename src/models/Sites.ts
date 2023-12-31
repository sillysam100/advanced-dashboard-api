import mongoose, { Schema, Document } from "mongoose";
import { ISite } from "../interfaces/Site";

const SiteSchema: Schema = new Schema({
  name: { type: String, required: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
});

export const Site = mongoose.model<ISite>("Site", SiteSchema);

export default Site;
