import mongoose from "mongoose";
import { IRegister } from "./Register";

export interface ILayoutEntry {
  registerId: mongoose.Schema.Types.ObjectId;
  cols: number;
  rows: number;
  position: number;
}

export interface IPage extends mongoose.Document {
  _id?: mongoose.Schema.Types.ObjectId;
  siteId: mongoose.Schema.Types.ObjectId;
  name: string;
  registers: IRegister["_id"][];
  layout: ILayoutEntry[];
}
