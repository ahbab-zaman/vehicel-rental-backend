import pool from "../../config/database";
import { AppError } from "../../middleware/error.middleware";

export class VehicleService {
  static async createVehicle(vehicleData: any) {
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
      `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
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
  }

  static async getAllVehicles() {
    const result = await pool.query("SELECT * FROM vehicles ORDER BY id");
    return result.rows;
  }

  static async getVehicleById(vehicleId: number) {
    const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [
      vehicleId,
    ]);

    if (result.rows.length === 0) {
      throw new AppError("Vehicle not found", 404);
    }

    return result.rows[0];
  }

  static async updateVehicle(vehicleId: number, updateData: any) {
    // Check if vehicle exists
    await this.getVehicleById(vehicleId);

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

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
      `UPDATE vehicles SET ${fields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async deleteVehicle(vehicleId: number) {
    // Check if vehicle exists
    await this.getVehicleById(vehicleId);

    // Check for active bookings
    const bookings = await pool.query(
      "SELECT * FROM bookings WHERE vehicle_id = $1 AND status = $2",
      [vehicleId, "active"]
    );

    if (bookings.rows.length > 0) {
      throw new AppError("Cannot delete vehicle with active bookings", 400);
    }

    await pool.query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
  }
}
