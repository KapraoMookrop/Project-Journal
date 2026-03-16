import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadJournal } from "../middleware/uploadJournal.middleware.js";
import * as JournalController from "../controllers/journal.controller.js";

const router = Router();

router.post("/CreateJournal", authenticateToken, uploadJournal.single("file"), JournalController.CreateJournal);
router.get("/GetMyJournals", authenticateToken, JournalController.GetMyJournals);
router.get("/GetJournalForReviewer", authenticateToken, JournalController.GetJournalForReviewer);
router.get("/GetJournalVersions", authenticateToken, JournalController.GetJournalVersions);

export default router;