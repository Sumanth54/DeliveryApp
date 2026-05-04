import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new AppError("Route not found.", 404));
}

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
    return;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    response.status(401).json({
      message: "Invalid or expired token."
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    message: "Internal server error."
  });
}
