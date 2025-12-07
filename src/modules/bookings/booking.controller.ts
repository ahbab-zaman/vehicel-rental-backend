import { Response, NextFunction } from "express";
import { successResponse } from "../../utils/responses";
import { AuthRequest } from "../../types";
import {
  createBookingService,
  getAllBookingsService,
  updateBookingService,
} from "./booking.service";

// ==========================
// CREATE BOOKING
// ==========================
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = await createBookingService(req.body);
    res
      .status(201)
      .json(successResponse("Booking created successfully", booking));
  } catch (error) {
    next(error);
  }
};

// ==========================
// GET ALL BOOKINGS
// ==========================
export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await getAllBookingsService(req.user!.id, req.user!.role);

    const message =
      req.user!.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.json(successResponse(message, bookings));
  } catch (error) {
    next(error);
  }
};

// ==========================
// UPDATE BOOKING
// ==========================
export const updateBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = parseInt(req.params.bookingId!);

    const booking = await updateBookingService(bookingId, req.body, req.user);

    let message = "Booking updated successfully";

    if (req.body.status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (req.body.status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }

    res.json(successResponse(message, booking));
  } catch (error) {
    next(error);
  }
};
