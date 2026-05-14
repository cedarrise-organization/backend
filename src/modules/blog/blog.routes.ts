//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { blogBodySchema, blogParamSchema, blogQuerySchema } from "./blog.schema.js";
import {
  listBlogController,
  getSingleBlogController,
  createBlogController,
  deleteBlogController,
  updateBlogController,
} from "./blog.controller.js";
import { upload } from "../../configs/multer.config.js";
const router = express.Router();

// List published blog posts
router.get("/", listBlogController);

// Get single post
router.get("/:id", getSingleBlogController);

// Create blog post (draft)
router.post("/", upload.single("file"), validateRequest(blogBodySchema), createBlogController);

// Delete blog post
router.delete("/:id", deleteBlogController);

// Update post content or publish
router.patch("/:id", updateBlogController);

export default router;
