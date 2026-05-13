import express from "express";
import { donateSchema } from "./donate.schema.js";
import { initializeController } from "./donate.controller.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
const router = express.Router();

router.post("/", validateRequest(donateSchema), initializeController);

export default router;