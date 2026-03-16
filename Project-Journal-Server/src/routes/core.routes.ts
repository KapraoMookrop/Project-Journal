import { Router } from "express";
import * as coreController from "../controllers/core.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/VerifyEmail", coreController.VerifyEmail);
router.post("/SendForgotPasswordEmail", coreController.SendForgotPasswordEmail);
router.post("/ChangePassword", coreController.ChangePassword);

export default router;