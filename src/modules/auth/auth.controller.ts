import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { successResponse } from "../../utils/responses";

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.signup(req.body);
      res
        .status(201)
        .json(successResponse("User registered successfully", user));
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json(successResponse("Email and password are required", null));
      }

      const data = await AuthService.signin(email, password);
      res.json(successResponse("Login successful", data));
    } catch (error) {
      next(error);
    }
  }
}
