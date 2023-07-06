import mongoose, { Schema, Document } from "mongoose";
import { IOrganization } from "../interfaces/Organization";

const OrganizationSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);
