//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { exampleBody, exampleParam, exampleQuery } from "./dashboard.schema.js";
import { getCardsController } from "./dashboard.controller.js";
const router = express.Router();

router.get("/cards", getCardsController);
// router.get("/");
// router.get("/");
// router.get("/");
// router.get("/");
// router.get("/");
// router.get("/");
// router.get("/");

export default router;
