import { Router } from "express";
import {
  updateUserController,
  getUsersController,
  deleteUserController,
} from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, authorize("admin"), getUsersController);
router.put("/:userId", authenticate, updateUserController);
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  deleteUserController
);

export default router;
