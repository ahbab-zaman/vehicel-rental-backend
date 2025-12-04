import { Request, Response, NextFunction } from "express";
import { VehicleService } from "./vehicle.service";
import { successResponse } from "../../utils/responses";

export class VehicleController {
  static async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      res
        .status(201)
        .json(successResponse("Vehicle created successfully", vehicle));
    } catch (error) {
      next(error);
    }
  }

  static async getAllVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await VehicleService.getAllVehicles();

      if (vehicles.length === 0) {
        return res.json(successResponse("No vehicles found", []));
      }

      res.json(successResponse("Vehicles retrieved successfully", vehicles));
    } catch (error) {
      next(error);
    }
  }

  static async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = parseInt(req.params.vehicleId!);
      const vehicle = await VehicleService.getVehicleById(vehicleId);
      res.json(successResponse("Vehicle retrieved successfully", vehicle));
    } catch (error) {
      next(error);
    }
  }

  static async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = parseInt(req.params.vehicleId!);
      const vehicle = await VehicleService.updateVehicle(vehicleId, req.body);
      res.json(successResponse("Vehicle updated successfully", vehicle));
    } catch (error) {
      next(error);
    }
  }

  static async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = parseInt(req.params.vehicleId!);
      await VehicleService.deleteVehicle(vehicleId);
      res.json(successResponse("Vehicle deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}
