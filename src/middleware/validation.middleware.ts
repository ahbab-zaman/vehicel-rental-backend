import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";

export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, phone, role } = req.body;
  const errors: any = {};

  if (!name || name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Phone number is required";
  }

  if (role && !["admin", "customer"].includes(role)) {
    errors.role = "Role must be either admin or customer";
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
};

export const validateVehicle = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;
  const errors: any = {};

  if (req.method === "POST") {
    if (!vehicle_name || vehicle_name.trim().length === 0) {
      errors.vehicle_name = "Vehicle name is required";
    }

    if (!type || !["car", "bike", "van", "SUV"].includes(type)) {
      errors.type = "Type must be car, bike, van, or SUV";
    }

    if (!registration_number || registration_number.trim().length === 0) {
      errors.registration_number = "Registration number is required";
    }

    if (!daily_rent_price || daily_rent_price <= 0) {
      errors.daily_rent_price = "Daily rent price must be positive";
    }

    if (
      !availability_status ||
      !["available", "booked"].includes(availability_status)
    ) {
      errors.availability_status =
        "Availability status must be available or booked";
    }
  } else {
    // For PUT requests, validate only provided fields
    if (type && !["car", "bike", "van", "SUV"].includes(type)) {
      errors.type = "Type must be car, bike, van, or SUV";
    }

    if (daily_rent_price !== undefined && daily_rent_price <= 0) {
      errors.daily_rent_price = "Daily rent price must be positive";
    }

    if (
      availability_status &&
      !["available", "booked"].includes(availability_status)
    ) {
      errors.availability_status =
        "Availability status must be available or booked";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
};

export const validateBooking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
  const errors: any = {};

  if (!customer_id) {
    errors.customer_id = "Customer ID is required";
  }

  if (!vehicle_id) {
    errors.vehicle_id = "Vehicle ID is required";
  }

  if (!rent_start_date) {
    errors.rent_start_date = "Start date is required";
  }

  if (!rent_end_date) {
    errors.rent_end_date = "End date is required";
  }

  if (rent_start_date && rent_end_date) {
    const startDate = new Date(rent_start_date);
    const endDate = new Date(rent_end_date);

    if (isNaN(startDate.getTime())) {
      errors.rent_start_date = "Invalid start date format";
    }

    if (isNaN(endDate.getTime())) {
      errors.rent_end_date = "Invalid end date format";
    }

    if (startDate >= endDate) {
      errors.rent_end_date = "End date must be after start date";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
};
