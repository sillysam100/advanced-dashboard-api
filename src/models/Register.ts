import mongoose, { Schema } from "mongoose";
import { IRegister } from "../interfaces/Register";

const RegisterSchema: Schema = new Schema({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  controlType: { type: String, required: true },
  value: { type: String, required: false },
  unit: { type: String, required: false },
});

export const Register = mongoose.model<IRegister>("Register", RegisterSchema);

export default Register;
