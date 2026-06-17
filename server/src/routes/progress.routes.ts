import { Router } from "express";
import {
  getSummary,
  listLessonProgress,
  setLessonProgress,
} from "../controllers/progress.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/summary", asyncHandler(getSummary));
router.get("/lessons", asyncHandler(listLessonProgress));
router.post("/lessons", asyncHandler(setLessonProgress));

export default router;
