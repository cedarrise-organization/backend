//ROUTES
import express from "express";
import { paginationQuerySchema } from "../../db/globalschema/global.schema.js";
import {
  ashDropdownController,
  recommendedDropdownController,
  onboardedDropdownController,
  volunteerDropdownController,
  tacotsProfileDropdownController,
  ashProfileDropdownController,
} from "./lookup.controller.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
const router = express.Router();

// Searchable paginated list of ash_student records for dropdown population
router.get("/ash-students", ashDropdownController);
// Searchable list of SELECTED tacots_recommendation records for onboarding dropdown
router.get("/tacots-recommended", recommendedDropdownController);
// Searchable list of tacots_onboarding records for tracking/exit dropdowns
router.get("/tacots-onboarded", onboardedDropdownController);
// Searchable list of volunteer records for mentorship assignment
router.get("/volunteers", volunteerDropdownController);
// Searchable list of tacots_recommendation records for tacots student profile
router.get(
  "/tacots-students-profile",
  authenticate(),
  authorize("read"),
  validateRequest(paginationQuerySchema),
  tacotsProfileDropdownController,
);
// Searchable list of ash_student records for ash student profile
router.get(
  "/ash-students-profile",
  authenticate(),
  authorize("read"),
  validateRequest(paginationQuerySchema),
  ashProfileDropdownController,
);

export default router;
