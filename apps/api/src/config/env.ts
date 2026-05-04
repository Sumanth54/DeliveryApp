import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "development-secret",
  mongodbUri: process.env.MONGODB_URI ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  adminPhone: process.env.ADMIN_PHONE ?? "9876500000",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? ""
};
