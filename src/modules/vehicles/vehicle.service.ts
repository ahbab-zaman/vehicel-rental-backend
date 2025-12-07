import pool from "../../config/database";
import { AppError } from "../../middleware/error.middleware";

export const createVehicle = async (vehicleData: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = vehicleData;

  // Check if registration number exists
  const existing = await pool.query(
    "SELECT * FROM vehicles WHERE registration_number = $1",
    [registration_number]
  );

  if (existing.rows.length > 0) {
    throw new AppError("Registration number already exists", 400);
  }

  const result = await pool.query(
    `INSERT INTO vehicles 
      (vehicle_name, type, registration_number, daily_rent_price, availability_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rows[0];
};

export const getAllVehicles = async () => {
  const result = await pool.query("SELECT * FROM vehicles ORDER BY id");
  return result.rows;
};

export const getVehicleById = async (vehicleId: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);

  if (result.rows.length === 0) {
    throw new AppError("Vehicle not found", 404);
  }

  return result.rows[0];
};

export const updateVehicle = async (vehicleId: number, updateData: any) => {
  // Ensure vehicle exists
  await getVehicleById(vehicleId);

  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Build dynamic update query
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updateData[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new AppError("No fields to update", 400);
  }

  values.push(vehicleId);

  const result = await pool.query(
    `UPDATE vehicles SET ${fields.join(", ")} 
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

export const deleteVehicle = async (vehicleId: number) => {
  // Ensure vehicle exists
  await getVehicleById(vehicleId);

  // Check for active bookings
  const bookings = await pool.query(
    "SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2",
    [vehicleId, "active"]
  );

  if (bookings.rows.length > 0) {
    throw new AppError("Cannot delete vehicle with active bookings", 400);
  }

  await pool.query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
};
