import { Router } from "express";
import * as coreController from "../controllers/core.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/verifyEmail", coreController.VerifyEmail);

export default router;