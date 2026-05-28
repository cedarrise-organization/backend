//ROUTES
import express from "express";
import { validateRequest } from "../../../middleware/validate.middleware.js";
import { carouselSchema } from "./carousels.schema.js";
import {
  ashCarouselController,
  tacotsCarouselController,
  capacityCarouselController,
  outreachCarouselController,
} from "./carousels.controller.js";
const router = express.Router();

router.get("/ash", validateRequest(carouselSchema), ashCarouselController);
router.get("/tacots", validateRequest(carouselSchema), tacotsCarouselController);
router.get("/capacity-building", validateRequest(carouselSchema), capacityCarouselController);
router.get("/outreaches", validateRequest(carouselSchema), outreachCarouselController);

export default router;
