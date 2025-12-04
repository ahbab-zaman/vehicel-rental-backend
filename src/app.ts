import express, { Application } from "express";
import cors from "cors";
import { successResponse } from "./utils/responses";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import vehicleRoutes from "./modules/vehicles/vehicle.routes";
import userRoutes from "./modules/users/user.routes";
import bookingRoutes from "./modules/bookings/booking.routes";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json(
    successResponse("Vehicle Rental API is running", {
      version: "1.0.0",
      endpoints: {
        auth: "/api/v1/auth",
        vehicles: "/api/v1/vehicles",
        users: "/api/v1/users",
        bookings: "/api/v1/bookings",
      },
    })
  );
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json(successResponse("Route not found", null));
});

// Error handler
app.use(errorHandler);

export default app;
