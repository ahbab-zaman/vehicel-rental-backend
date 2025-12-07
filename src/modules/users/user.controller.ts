import { Response, NextFunction } from "express";
import { getAllUsers, updateUser, deleteUser } from "./user.service";
import { successResponse } from "../../utils/responses";
import { AuthRequest } from "../../types";

export const getUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();
    res.json(successResponse("Users retrieved successfully", users));
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId!);
    const user = await updateUser(userId, req.body, req.user);
    res.json(successResponse("User updated successfully", user));
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId!);
    await deleteUser(userId);
    res.json(successResponse("User deleted successfully"));
  } catch (error) {
    next(error);
  }
};
