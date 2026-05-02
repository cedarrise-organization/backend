//ROUTES
import express from "express";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { exampleBody, exampleParam, exampleQuery } from "./feature.schema.js";
const router = express.Router();

router.get("/");
router.post("/");
router.put("/");
router.delete("/");

export default router;
