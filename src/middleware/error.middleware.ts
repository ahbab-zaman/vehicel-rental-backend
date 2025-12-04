import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responses";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json(errorResponse(message, err.errors));
};

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
