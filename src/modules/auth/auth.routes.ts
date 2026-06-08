//ROUTES
import express from "express";
import { userSchema } from "./auth.schema.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { loginController, logoutController, sessionController } from "./auth.controller.js";

const router = express.Router();

// Logs a user in
router.post("/login", validateRequest(userSchema), loginController);

// Logs a user out
router.post("/logout", logoutController);

// Verifies a users session
router.get("/session", authenticate(), sessionController)

export default router;
