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
} from "./general.controller.js";
const router = express.Router();

// PROJECTS
/**
 * @route GET /api/v1/general/projects
 * @desc Retrieve a list of all project records, ordered by creation date and status.
 * @access Private (authenticated, requires "read" permission)
 * @response {200} SuccessResponse - List of projects and the count of ongoing projects
 * @cache Key: `cedarrise:dashboard:projects` (TTL: 1 hour)
 */
router.get("/projects", authenticate(), authorize("read"), getProjectsController);

/**
 * @route POST /api/v1/general/projects
 * @desc Create a new project record and optionally upload a project banner/image to Cloudinary.
 * @access Private (authenticated, requires "read" permission)
 * @body {string} title - Min 3 characters, max 150 characters
 * @body {string} [description] - Optional description
 * @body {file} [file] - Optional image file (jpg, jpeg, png, webp) up to 20MB
 * @response {200} SuccessResponse - Created project record
 * @cacheInvalidation Clears key `cedarrise:dashboard:projects`
 */
router.post(
  "/projects",
  upload.single("file"),
  authenticate(),
  authorize("read"),
  validateRequest(projectsSchema),
  createProjectsController,
);

/**
 * @route PATCH /api/v1/general/projects/:id
 * @desc Update the status of an existing project.
 * @access Private (authenticated, requires "read" permission)
 * @params {uuid} id - Project ID
 * @query {"ongoing" | "completed"} status - New status
 * @response {200} SuccessResponse - Updated project record
 * @cacheInvalidation Clears key `cedarrise:dashboard:projects`
 */
router.patch(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(projectStatusSchema),
  updateProjectStatusController,
);

/**
 * @route DELETE /api/v1/general/projects/:id
 * @desc Delete a project record and its associated image from Cloudinary.
 * @access Private (authenticated, requires "read" permission)
 * @params {uuid} id - Project ID to delete
 * @response {200} SuccessResponse - Deletion confirmation message
 * @cacheInvalidation Clears key `cedarrise:dashboard:projects`
 */
router.delete(
  "/projects/:id",
  authenticate(),
  authorize("read"),
  validateRequest(generalParamSchema),
  deleteProjectsController,
);

// RECEIPTS
/**
 * @route GET /api/v1/general/receipts
 * @desc Retrieve a paginated, filterable list of all receipts.
 * @access Private (authenticated, requires "read" permission)
 * @query {number} [page=1] - Page number (integer >= 1)
 * @query {number} [limit=25] - Items per page (integer 1-100)
 * @query {"asc" | "desc"} [orderBy="desc"] - Sort direction
 * @query {"name" | "amount" | "description" | "uploadedBy" | "createdAt"} [sortBy="createdAt"] - Column to sort by
 * @query {string} [search] - Full-text search term. Bypasses cache when provided.
 * @response {200} SuccessResponse - Paginated array of receipts and pagination metadata
 * @cache Key: `cedarrise:general:receipts:{page}:{limit}:{orderBy}:{sortBy}` (TTL: 1 hour)
 */
router.get(
  "/receipts",
  authenticate(),
  authorize("read"),
  validateRequest(receiptsQuerySchema),
  getReceiptsController,
);

/**
 * @route POST /api/v1/general/receipts
 * @desc Create a new receipt record, upload the receipt image to Cloudinary, and save details.
 * @access Private (authenticated, requires "create" permission)
 * @body {string} name - Min 3 characters, max 150 characters
 * @body {number} amount - Integer >= 1000
 * @body {string} [description] - Optional receipt description
 * @body {file} file - Required receipt image file (jpg, jpeg, png, webp) up to 20MB
 * @response {200} SuccessResponse - Created receipt record
 * @cacheInvalidation Clears all keys matching pattern `cedarrise:general:receipts:*`
 */
router.post(
  "/receipts",
  upload.single("file"),
  authenticate(),
  authorize("create"),
  validateRequest(receiptsSchema),
  createReceiptsController,
);

/**
 * @route DELETE /api/v1/general/receipts/:id
 * @desc Delete a receipt record by ID and its corresponding image from Cloudinary.
 * @access Private (authenticated, requires "delete" permission)
 * @params {uuid} id - Receipt ID
 * @response {200} SuccessResponse - Deletion confirmation message
 * @cacheInvalidation Clears all keys matching pattern `cedarrise:general:receipts:*`
 */
router.delete(
  "/receipts/:id",
  authenticate(),
  authorize("delete"),
  validateRequest(generalParamSchema),
  deleteReceiptsController,
);

/**
 * @route GET /api/v1/general/download/receipts
 * @desc Download the entire receipts table as a CSV file export.
 * @access Private (authenticated, requires "read" permission)
 * @response {200} File - CSV file containing all receipts records
 */
router.get("/download/receipts", authenticate(), authorize("read"), exportReceiptsController);

export default router;
