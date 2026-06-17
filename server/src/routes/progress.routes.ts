import { Router } from "express";
import {
  getSummary,
  setLessonProgress,
} from "../controllers/progress.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/summary", asyncHandler(getSummary));
router.post("/lessons", asyncHandler(setLessonProgress));

export default router;
