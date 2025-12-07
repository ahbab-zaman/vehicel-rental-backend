import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/responses";
import { signupService, signinService } from "./auth.service";

// =====================
// SIGNUP CONTROLLER
// =====================
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await signupService(req.body);
    res.status(201).json(successResponse("User registered successfully", user));
  } catch (error) {
    next(error);
  }
};

// =====================
// SIGNIN CONTROLLER
// =====================
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(successResponse("Email and password are required", null));
    }

    const data = await signinService(email, password);
    res.json(successResponse("Login successful", data));
  } catch (error) {
    next(error);
  }
};
