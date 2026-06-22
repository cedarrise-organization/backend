//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { upload } from "../../configs/multer.config.js";
import {
  generalParamSchema,
  projectsSchema,
  projectStatusSchema,
  receiptsSchema,
  receiptsQuerySchema,
  gallerySchema,
  googleSchema,
} from "./general.schema.js";
import {
  getProjectsController,
  createProjectsController,
  updateProjectStatusController,
  deleteProjectsController,
  getReceiptsController,
  createReceiptsController,
  deleteReceiptsController,
  exportReceiptsController,
  uploadPhotosController,
  uploadGoogleFormController,
  getGoogleFormController,
  getMetadataController
} from "./general.controller.js";
const router = express.Router();

// PROJECTS
// Retrieve a list of all project records, ordered by creation date and status.
router.get("/projects", authenticate(), authorize("read"), getProjectsController);
// Create a new project record and optionally upload a project banner/image to Cloudinary.
router.post(
  "/projects",
  upload.single("file"),
  authenticate(),
  authorize("read"),
  validateRequest(projectsSchema),
  createProjectsController,
);
// Update the status of an existing project.
router.patch(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(projectStatusSchema),
  updateProjectStatusController,
);
//Delete a project record and its associated image from Cloudinary.
router.delete(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(generalParamSchema),
  deleteProjectsController,
);

// RECEIPTS
// Retrieve a paginated, filterable list of all receipts.
router.get(
  "/receipts",
  authenticate(),
  authorize("read"),
  validateRequest(receiptsQuerySchema),
  getReceiptsController,
);
// Create a new receipt record, upload the receipt image to Cloudinary, and save details.
router.post(
  "/receipts",
  upload.single("file"),
  authenticate(),
  authorize("create"),
  validateRequest(receiptsSchema),
  createReceiptsController,
);
// Delete a receipt record by ID and its corresponding image from Cloudinary.
router.delete(
  "/receipts/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(generalParamSchema),
  deleteReceiptsController,
);

// Download the entire receipts table as a CSV file export.
router.get("/download/receipts", authenticate(), authorize("read"), exportReceiptsController);

// PHOTO UPLOADS
router.post(
  "/gallery",
  upload.array("photos", 10),
  authenticate(),
  authorize("create"),
  validateRequest(gallerySchema),
  uploadPhotosController,
);

// GOOGLE-FORM UPLOADS
// Get google form 
router.get("/google-forms", getGoogleFormController)
router.get("/metadata", authenticate(), authorize("read"), getMetadataController)
// Upload google form
router.post(
  "/google-forms",
  authenticate(),
  authorize("create"),
  validateRequest(googleSchema),
  uploadGoogleFormController,
);

export default router;
