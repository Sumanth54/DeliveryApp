import { Router } from "express";
import { me, requestOtp, verifyOtp } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/request-otp", asyncHandler(requestOtp));
authRouter.post("/verify-otp", asyncHandler(verifyOtp));
authRouter.get("/me", asyncHandler(authenticate), asyncHandler(me));
