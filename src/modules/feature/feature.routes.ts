//ROUTES
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { exampleBody, exampleParam, exampleQuery } from "./feature.schema.js";
import { upload } from "../../configs/multer.config.js";
const router = express.Router();

router.get("/");
router.post("/");
router.put("/");
router.delete("/");

export default router;
