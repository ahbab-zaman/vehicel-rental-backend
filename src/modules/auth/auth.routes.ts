import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateSignup } from "../../middleware/validation.middleware";

const router = Router();

router.post("/signup", validateSignup, AuthController.signup);
router.post("/signin", AuthController.signin);

export default router;
