import { Router } from "express";
import {
  createVehicleController,
  getAllVehiclesController,
  getVehicleByIdController,
  updateVehicleController,
  deleteVehicleController,
} from "./vehicle.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { validateVehicle } from "../../middleware/validation.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateVehicle,
  createVehicleController
);
router.get("/", getAllVehiclesController);
router.get("/:vehicleId", getVehicleByIdController);
router.put(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  validateVehicle,
  updateVehicleController
);
router.delete(
  "/:vehicleId",
  authenticate,
  authorize("admin"),
  deleteVehicleController
);

export default router;
