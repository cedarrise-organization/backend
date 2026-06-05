//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { projectsSchema, projectStatusSchema, generalParamSchema } from "./general.schema.js";
import {
  getProjectsController,
  createProjectsController,
  updateProjectStatusController,
  deleteProjectsController,
} from "./general.controller.js";
import { upload } from "../../configs/multer.config.js";
const router = express.Router();

router.get("/projects", authenticate(), authorize("read"), getProjectsController);
router.post(
  "/projects",
  upload.single("file"),
  authenticate(),
  authorize("read"),
  validateRequest(projectsSchema),
  createProjectsController,
);
router.patch(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(projectStatusSchema),
  updateProjectStatusController,
);
router.delete(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(generalParamSchema),
  deleteProjectsController,
);

export default router;
