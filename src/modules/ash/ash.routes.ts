//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { submitRegisterationController } from "./ash.controller.js";
import { upload } from "../../configs/multer.config.js";
import { createAshStudentSchema } from "./ash.schema.js";

const router = express.Router();

router.post(
  "/registration",
  upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "lastResult", maxCount: 1 },
    { name: "parentSignature", maxCount: 1 },
  ]),
  validateRequest(createAshStudentSchema),
  submitRegisterationController,
);

export default router;
