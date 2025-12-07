import pool from "../../config/database";
import { AppError } from "../../middleware/error.middleware";

// ==========================
// CREATE BOOKING SERVICE
// ==========================
export const createBookingService = async (bookingData: any) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
    bookingData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check customer exists
    const customerResult = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      throw new AppError("Customer not found", 404);
    }

    // Check vehicle exists and available
    const vehicleResult = await client.query(
      "SELECT * FROM vehicles WHERE id = $1",
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      throw new AppError("Vehicle not found", 404);
    }

    const vehicle = vehicleResult.rows[0];

    if (vehicle.availability_status === "booked") {
      throw new AppError("Vehicle is not available for booking", 400);
    }

    // Price calculation
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);
    const numberOfDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const total_price = vehicle.daily_rent_price * numberOfDays;

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        "active",
      ]
    );

    // Update vehicle status
    await client.query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
      ["booked", vehicle_id]
    );

    await client.query("COMMIT");

    const booking = bookingResult.rows[0];

    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ==========================
// GET ALL BOOKINGS SERVICE
// ==========================
export const getAllBookingsService = async (
  userId: number,
  userRole: string
) => {
  let query = "";
  let params: any[] = [];

  if (userRole === "admin") {
    query = `
      SELECT 
        b.*,
        json_build_object('name', u.name, 'email', u.email) as customer,
        json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) as vehicle
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id
    `;
  } else if (userRole === "customer") {
    query = `
      SELECT 
        b.*,
        json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) as vehicle
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id
    `;
    params = [userId];
  } else {
    throw new AppError("Invalid user role", 400);
  }

  const result = await pool.query(query, params);
  return result.rows;
};

// ==========================
// UPDATE BOOKING SERVICE
// ==========================
export const updateBookingService = async (
  bookingId: number,
  updateData: any,
  user: any
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Fetch booking
    const bookingResult = await client.query(
      "SELECT * FROM bookings WHERE id = $1",
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new AppError("Booking not found", 404);
    }

    const booking = bookingResult.rows[0];

    // Customer access restriction
    if (user.role === "customer" && booking.customer_id !== user.id) {
      throw new AppError(
        "Access forbidden: You can only update your own bookings",
        403
      );
    }

    const { status } = updateData;

    // ==========================
    // CUSTOMER CANCELLED
    // ==========================
    if (user.role === "customer" && status === "cancelled") {
      const today = new Date();
      const startDate = new Date(booking.rent_start_date);

      if (startDate <= today) {
        throw new AppError(
          "Cannot cancel booking that has already started",
          400
        );
      }

      if (booking.status !== "active") {
        throw new AppError("Only active bookings can be cancelled", 400);
      }

      await client.query("UPDATE bookings SET status = $1 WHERE id = $2", [
        "cancelled",
        bookingId,
      ]);

      await client.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );

      await client.query("COMMIT");

      const updatedResult = await pool.query(
        "SELECT * FROM bookings WHERE id = $1",
        [bookingId]
      );
      return updatedResult.rows[0];
    }

    // ==========================
    // ADMIN RETURN VEHICLE
    // ==========================
    if (user.role === "admin" && status === "returned") {
      if (booking.status !== "active") {
        throw new AppError(
          "Only active bookings can be marked as returned",
          400
        );
      }

      await client.query("UPDATE bookings SET status = $1 WHERE id = $2", [
        "returned",
        bookingId,
      ]);

      await client.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );

      await client.query("COMMIT");

      const updatedResult = await pool.query(
        `SELECT b.*,
          json_build_object('availability_status', v.availability_status) as vehicle
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.id = $1`,
        [bookingId]
      );

      return updatedResult.rows[0];
    }

    throw new AppError("Invalid status update", 400);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ==========================
// AUTO RETURN EXPIRED BOOKINGS
// ==========================
export const autoReturnExpiredBookings = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const today = new Date().toISOString().split("T")[0];

    const expiredBookings = await client.query(
      "SELECT * FROM bookings WHERE status = $1 AND rent_end_date < $2",
      ["active", today]
    );

    for (const booking of expiredBookings.rows) {
      await client.query("UPDATE bookings SET status = $1 WHERE id = $2", [
        "returned",
        booking.id,
      ]);

      await client.query(
        "UPDATE vehicles SET availability_status = $1 WHERE id = $2",
        ["available", booking.vehicle_id]
      );
    }

    await client.query("COMMIT");

    console.log(
      `✅ Auto-returned ${expiredBookings.rows.length} expired bookings`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Auto-return error:", error);
  } finally {
    client.release();
  }
};
