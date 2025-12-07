import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import config from "../../config";

const JWT_SECRET = config.jwtSecret!; // guarantee string
const SALT_ROUNDS = 10;

// =====================
// SIGNUP SERVICE
// =====================
export const signupService = async (userData: any) => {
  const { name, email, password, phone, role = "customer" } = userData;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError("Email already registered", 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashedPassword, phone, role]
  );

  return result.rows[0];
};

// =====================
// SIGNIN SERVICE
// =====================
export const signinService = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);

  if (result.rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};
