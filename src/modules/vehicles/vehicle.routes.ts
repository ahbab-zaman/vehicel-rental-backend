import { Router } from "express";
import { VehicleController } from "./vehicle.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validateVehicle } from "../../middleware/validation.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateVehicle,
  VehicleController.createVehicle
);
router.get("/", VehicleController.getAllVehicles);
router.get("/:vehicleId", VehicleController.getVehicleById);
router.put(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  validateVehicle,
  VehicleController.updateVehicle
);
router.delete(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  VehicleController.deleteVehicle
);

export default router;
