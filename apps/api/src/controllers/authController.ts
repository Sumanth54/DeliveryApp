import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

const phoneSchema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."),
  name: z.string().trim().min(2).max(40).optional()
});

const verifySchema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  otp: z.string().trim().length(6),
  name: z.string().trim().min(2).max(40).optional()
});

export async function requestOtp(request: import("express").Request, response: import("express").Response) {
  const payload = phoneSchema.parse(request.body);
  const existingUser = await User.findOne({ phone: payload.phone }).lean();
  const otp = "123456";
  const role = payload.phone === env.adminPhone ? "admin" : existingUser?.role ?? "customer";

  const user = await User.findOneAndUpdate(
    { phone: payload.phone },
    {
      $set: {
        name: existingUser?.name ?? payload.name ?? (role === "admin" ? "Kirana Admin" : "Shopper"),
        role,
        lastOtpCode: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    },
    {
      new: true,
      upsert: true
    }
  ).lean();

  response.json({
    message: "OTP generated.",
    debugOtp: otp,
    user: {
      id: String(user?._id),
      name: user?.name,
      phone: user?.phone,
      role: user?.role
    }
  });
}

export async function verifyOtp(request: import("express").Request, response: import("express").Response) {
  const payload = verifySchema.parse(request.body);
  const user = await User.findOne({ phone: payload.phone });

  if (!user || user.lastOtpCode !== payload.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    response.status(400).json({
      message: "Invalid or expired OTP."
    });
    return;
  }

  if (payload.name) {
    user.name = payload.name;
  }

  user.lastOtpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signToken({
    sub: String(user._id),
    role: user.role,
    phone: user.phone,
    name: user.name
  });

  response.json({
    token,
    user: {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      role: user.role
    }
  });
}

export async function me(request: import("express").Request, response: import("express").Response) {
  response.json({
    user: request.user
  });
}
