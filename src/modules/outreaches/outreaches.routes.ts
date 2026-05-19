//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { outreachController } from "./outreaches.controller.js";
import { upload } from "../../configs/multer.config.js";

const router = express.Router();

router.post(
  "/reccomendation",
  // upload.fields([
  //   { name: "", maxCount: 1 },
  //   { name: "", maxCount: 1 },
  //   { name: "=", maxCount: 1 },
  // ]),
  // validateRequest(),
  outreachController,
);

export default router;
