//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { submitVRegisterationController } from "./volunteer.controller.js";
import { upload } from "../../configs/multer.config.js";

const router = express.Router();

router.post(
  "/registration",
  // upload.fields([
  //   { name: "", maxCount: 1 },
  //   { name: "", maxCount: 1 },
  //   { name: "", maxCount: 1 },
  // ]),
  // validateRequest(),
  submitVRegisterationController,
);

export default router;
