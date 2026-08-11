//ROUTES
import express from "express";
import {
  ashDropdownController,
  recommendedDropdownController,
  onboardedDropdownController,
  volunteerDropdownController,
  tacotsProfileDropdownController,
  ashProfileDropdownController,
} from "./lookup.controller.js";
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
router.get("/tacots-students-profile", tacotsProfileDropdownController);
// Searchable list of ash_student records for ash student profile
router.get("/ash-students-profile", ashProfileDropdownController);

export default router;
