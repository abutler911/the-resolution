import { Router } from "express";
import { getLesson, listLessons } from "../controllers/lessons.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listLessons));
router.get("/:slug", asyncHandler(getLesson));

export default router;
