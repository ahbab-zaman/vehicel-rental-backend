import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, authorize("admin"), UserController.getAllUsers);
router.put("/:userId", authenticate, UserController.updateUser);
router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  UserController.deleteUser
);

export default router;
