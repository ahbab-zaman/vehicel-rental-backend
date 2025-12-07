import { Request, Response, NextFunction } from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "./vehicle.service";
import { successResponse } from "../../utils/responses";

export const createVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicle = await createVehicle(req.body);
    res
      .status(201)
      .json(successResponse("Vehicle created successfully", vehicle));
  } catch (error) {
    next(error);
  }
};

export const getAllVehiclesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicles = await getAllVehicles();

    if (vehicles.length === 0) {
      return res.json(successResponse("No vehicles found", []));
    }

    res.json(successResponse("Vehicles retrieved successfully", vehicles));
  } catch (error) {
    next(error);
  }
};

export const getVehicleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId!);
    const vehicle = await getVehicleById(vehicleId);
    res.json(successResponse("Vehicle retrieved successfully", vehicle));
  } catch (error) {
    next(error);
  }
};

export const updateVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId!);
    const vehicle = await updateVehicle(vehicleId, req.body);
    res.json(successResponse("Vehicle updated successfully", vehicle));
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId!);
    await deleteVehicle(vehicleId);
    res.json(successResponse("Vehicle deleted successfully"));
  } catch (error) {
    next(error);
  }
};
