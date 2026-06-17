import { Router } from "express";
import authRoutes from "./auth.routes.js";
import exerciseRoutes from "./exercises.routes.js";
import lessonRoutes from "./lessons.routes.js";
import progressRoutes from "./progress.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "the-resolution-api" });
});

router.use("/auth", authRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/lessons", lessonRoutes);
router.use("/progress", progressRoutes);

export default router;
