import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import {
  createSession,
  deleteSession,
  getSession,
  getToday,
  listSessions,
  updateSession,
} from "../controllers/sessions.controller.js";
import {
  createPiece,
  deletePiece,
  getPiece,
  listPieces,
  updatePiece,
} from "../controllers/pieces.controller.js";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from "../controllers/goals.controller.js";
import { getInsights } from "../controllers/insights.controller.js";

// Everything under /api/practice is personal data — no anonymous access.
const router = Router();
router.use(requireAuth);

router.get("/sessions", asyncHandler(listSessions));
router.post("/sessions", asyncHandler(createSession));
router.get("/sessions/today", asyncHandler(getToday));
router.get("/sessions/:id", asyncHandler(getSession));
router.put("/sessions/:id", asyncHandler(updateSession));
router.delete("/sessions/:id", asyncHandler(deleteSession));

router.get("/pieces", asyncHandler(listPieces));
router.post("/pieces", asyncHandler(createPiece));
router.get("/pieces/:id", asyncHandler(getPiece));
router.patch("/pieces/:id", asyncHandler(updatePiece));
router.delete("/pieces/:id", asyncHandler(deletePiece));

router.get("/goals", asyncHandler(listGoals));
router.post("/goals", asyncHandler(createGoal));
router.patch("/goals/:id", asyncHandler(updateGoal));
router.delete("/goals/:id", asyncHandler(deleteGoal));

router.get("/insights", asyncHandler(getInsights));

export default router;
