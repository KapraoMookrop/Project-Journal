import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadJournal } from "../middleware/uploadJournal.middleware.js";
import * as JournalController from "../controllers/journal.controller.js";

const router = Router();

router.post("/createJournal", authenticateToken, uploadJournal.single("file"), JournalController.CreateJournal);
router.get("/getMyJournals", authenticateToken, JournalController.GetMyJournals);
router.get("/getJournalForReviewer", authenticateToken, JournalController.GetJournalForReviewer);
router.get("/getJournalVersions", authenticateToken, JournalController.GetJournalVersions);

export default router;