import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    next(new AppError("Please log in to continue.", 401));
    return;
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).lean();

  if (!user) {
    next(new AppError("User not found.", 401));
    return;
  }

  request.user = {
    id: String(user._id),
    name: user.name,
    phone: user.phone,
    role: user.role
  };

  next();
}

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if (!request.user || request.user.role !== "admin") {
    next(new AppError("Admin access required.", 403));
    return;
  }

  next();
}
