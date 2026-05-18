//ROUTES
import express from "express";
import {
  ashCarouselController,
  tacotsCarouselController,
  capacityCarouselController,
  outreachCarouselController,
} from "./carousels.controller.js";
const router = express.Router();

router.get("/ash", ashCarouselController);
router.get("/tacots", tacotsCarouselController);
router.get("/capacity-building", capacityCarouselController);
router.get("/outreaches", outreachCarouselController);

export default router;
