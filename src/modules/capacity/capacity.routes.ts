//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createEvaluationController,
  listAllEvaluationController,
  getEvaluationController,
  deleteEvaluationController,
  exportCapacityEvaluationController
} from "./capacity.controller.js";
import { upload } from "../../configs/multer.config.js";
import {
  createCapacityBuildingEvaluationSchema,
  capacityBuildingEvaluationParamsSchema,
  capacityBuildingEvaluationQuerySchema,
} from "./capacity.schema.js";

const router = express.Router();
router.use(authenticate());

// Submit Capacity Building Program Evaluation
router.post(
  "/",
  authorize("create"),
  validateRequest(createCapacityBuildingEvaluationSchema),
  createEvaluationController,
);

// Full evaluation record
router.get(
  "/:id",
  authorize("read"),
  validateRequest(capacityBuildingEvaluationParamsSchema),
  getEvaluationController,
);

// List evaluation submissions
router.get(
  "/",
  authorize("read"),
  validateRequest(capacityBuildingEvaluationQuerySchema),
  listAllEvaluationController,
);

// Delete evaluation record
router.delete(
  "/:id",
  authorize("delete"),
  validateRequest(capacityBuildingEvaluationParamsSchema),
  deleteEvaluationController,
);

// Download capacityBuildingEvaluation table
router.get("/download/capacityevaluation", authenticate(), authorize("read"), exportCapacityEvaluationController);

export default router;