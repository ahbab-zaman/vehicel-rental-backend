import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  updateBooking,
} from "./booking.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBooking } from "../../middleware/validation.middleware";

const router = Router();

router.post("/", authenticate, validateBooking, createBooking);
router.get("/", authenticate, getAllBookings);
router.put("/:bookingId", authenticate, updateBooking);

export default router;
