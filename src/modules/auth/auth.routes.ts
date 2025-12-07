import { Router } from "express";
import { signin, signup } from "./auth.controller";
import { validateSignup } from "../../middleware/validation.middleware";

const router = Router();

router.post("/signup", validateSignup, signup);
router.post("/signin", signin);

export default router;
