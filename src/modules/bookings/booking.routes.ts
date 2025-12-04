import { Router } from "express";
import { BookingController } from "./booking.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBooking } from "../../middleware/validation.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBooking,
  BookingController.createBooking
);
router.get("/", authenticate, BookingController.getAllBookings);
router.put("/:bookingId", authenticate, BookingController.updateBooking);

export default router;
