import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser, IUserRole } from "../interfaces/User";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "RoleId" },
  role: { type: String, ref: "Role" },
});

const UserRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ["observe", "edit", "admin"],
  },
  actions: [
    {
      type: String,
      required: true,
      enum: ["observe", "edit"],
    },
  ],
});

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
export const UserRole = mongoose.model<IUserRole>("UserRole", UserRoleSchema);
