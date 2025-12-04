import pool from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserService {
  static async getAllUsers() {
    const result = await pool.query(
      "SELECT id, name, email, phone, role FROM users ORDER BY id"
    );
    return result.rows;
  }

  static async updateUser(
    userId: number,
    updateData: any,
    requestingUser: any
  ) {
    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    // Authorization check: customers can only update their own profile
    if (requestingUser.role === "customer" && requestingUser.id !== userId) {
      throw new AppError(
        "Access forbidden: You can only update your own profile",
        403
      );
    }

    // Customers cannot change their own role
    if (requestingUser.role === "customer" && updateData.role) {
      throw new AppError(
        "Access forbidden: You cannot change your own role",
        403
      );
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    // Handle email to lowercase
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "id") {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new AppError("No fields to update", 400);
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount} 
       RETURNING id, name, email, phone, role`,
      values
    );

    return result.rows[0];
  }

  static async deleteUser(userId: number) {
    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    // Check for active bookings
    const bookings = await pool.query(
      "SELECT * FROM bookings WHERE customer_id = $1 AND status = $2",
      [userId, "active"]
    );

    if (bookings.rows.length > 0) {
      throw new AppError("Cannot delete user with active bookings", 400);
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  }
}
