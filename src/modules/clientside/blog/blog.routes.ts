//ROUTES
import express from "express";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { generalLimiter } from "../../../middleware/rateLimiter.middleware.js";
import { authenticate, authorize } from "../../../middleware/auth.middleware.js";
import {
  blogBodySchema,
  updateBlogSchema,
  blogParamSchema,
  blogQuerySchema,
} from "./blog.schema.js";
import {
  listBlogsController,
  getSingleBlogController,
  createBlogController,
  deleteBlogController,
  updateBlogController,
} from "./blog.controller.js";
import { upload } from "../../../configs/multer.config.js";

const router = express.Router();

// List published blog posts
router.get("/", validateRequest(blogQuerySchema), listBlogsController);

// Get single post
router.get("/:id", validateRequest(blogParamSchema), getSingleBlogController);

// Create blog post (draft)
router.post(
  "/",
  generalLimiter,
  authenticate(),
  upload.single("file"),
  validateRequest(blogBodySchema),
  createBlogController,
);

// Delete blog post
router.delete("/:id", authenticate(), validateRequest(blogParamSchema), deleteBlogController);

// Update post content or publish
router.patch(
  "/:id",
  generalLimiter,
  authenticate(),
  upload.single("file"),
  validateRequest(updateBlogSchema),
  updateBlogController,
);

export default router;
