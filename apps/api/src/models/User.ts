import { Schema, model } from "mongoose";

export type UserRole = "customer" | "admin";

export interface UserDocument {
  name: string;
  phone: string;
  role: UserRole;
  lastOtpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    },
    lastOtpCode: String,
    otpExpiresAt: Date
  },
  {
    timestamps: true
  }
);

export const User = model<UserDocument>("User", userSchema);
