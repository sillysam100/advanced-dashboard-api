import { IUser } from './User';
import { IRegister } from './Register';
import mongoose from 'mongoose';

export interface ISite extends Document {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  registers: IRegister['_id'][];
  userId: string | IUser['_id'];
}