//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { capacityController } from "./capacity.controller.js";
import { upload } from "../../configs/multer.config.js";

const router = express.Router();

router.post(
  "/capa",
  // upload.fields([
  //   { name: "", maxCount: 1 },
  //   { name: "", maxCount: 1 },
  //   { name: "=", maxCount: 1 },
  // ]),
  // validateRequest(),
  capacityController,
);

export default router;
