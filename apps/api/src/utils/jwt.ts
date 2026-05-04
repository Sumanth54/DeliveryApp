import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type TokenPayload = {
  sub: string;
  role: "customer" | "admin";
  phone: string;
  name: string;
};

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d"
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
