import mongoose, { Schema, Document } from 'mongoose';
import { ISite } from '../interfaces/Site';

const SiteSchema: Schema = new Schema({
  name: { type: String, required: true },
  registers: [{ type: Schema.Types.ObjectId, ref: 'Register' }],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Site = mongoose.model<ISite>('Site', SiteSchema);

export default Site;
