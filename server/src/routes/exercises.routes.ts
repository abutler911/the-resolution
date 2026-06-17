import { Router } from "express";
import {
  getQuestion,
  submitAttempt,
} from "../controllers/exercises.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

// Generating a practice question is open; recording an attempt requires auth.
router.get("/question", getQuestion);
router.post("/attempts", requireAuth, asyncHandler(submitAttempt));

export default router;
