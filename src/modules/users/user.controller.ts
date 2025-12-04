import { Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { successResponse } from "../../utils/responses";
import { AuthRequest } from "../../types";

export class UserController {
  static async getAllUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const users = await UserService.getAllUsers();
      res.json(successResponse("Users retrieved successfully", users));
    } catch (error) {
      next(error);
    }
  }


  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId!);
      const user = await UserService.updateUser(userId, req.body, req.user);
      res.json(successResponse("User updated successfully", user));
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId!);
      await UserService.deleteUser(userId);
      res.json(successResponse("User deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}
