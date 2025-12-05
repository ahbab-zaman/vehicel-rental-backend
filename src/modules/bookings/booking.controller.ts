import { Response, NextFunction } from "express";
import { BookingService } from "./booking.service";
import { successResponse } from "../../utils/responses";
import { AuthRequest } from "../../types";

export class BookingController {
  static async createBooking(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const booking = await BookingService.createBooking(req.body);
      res
        .status(201)
        .json(successResponse("Booking created successfully", booking));
    } catch (error) {
      next(error);
    }
  }

  static async getAllBookings(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const bookings = await BookingService.getAllBookings(
        req.user!.id,
        req.user!.role
      );

      const message =
        req.user!.role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully";

      res.json(successResponse(message, bookings));
    } catch (error) {
      next(error);
    }
  }

  static async updateBooking(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {

      const bookingId = parseInt(req.params.bookingId!);
      const booking = await BookingService.updateBooking(
        bookingId,
        req.body,
        req.user
      );

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
  }
}
