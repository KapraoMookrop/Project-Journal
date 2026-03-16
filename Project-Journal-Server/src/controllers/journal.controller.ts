import { type NextFunction, type Request, type Response } from "express";
import * as JournalService from "../services/journal.service.js";
import type { JournalRequestData } from "../module/JournalRequestData.js";
import { AppError } from "../errors/AppError.js";
import { UserRole } from "../module/Enum.js";

export async function CreateJournal(req: Request, res: Response, next: NextFunction) {
    try {
        const filePath = req.file?.path;
        const request: JournalRequestData  = JSON.parse(req.body.data);
        request.JournalVersionData.FileUrl = filePath as string;

        await JournalService.CreateJournal(request);
        res.json({ message: "สร้างวารสารสำเร็จ" });
    } catch (error) {
        console.error("Error in CreateJournal controller:", error);
        next(error);
    }
}

export async function GetMyJournals(req: Request, res: Response, next: NextFunction) {
    try {
        const journals = await JournalService.GetMyJournals((req as any).user?.userId);
        res.json(journals);
    } catch (error) {
        console.error("Error in GetMyJournals controller:", error);
        next(error);
    }
}

export async function GetJournalForReviewer(req: Request, res: Response, next: NextFunction) {
    try {
        const role = (req as any).user?.role;
        if (role !== UserRole.REVIEWER) {
            throw new AppError("ผู้ใช้ไม่มีสิทธิ์เข้าถึงข้อมูลนี้", 403);
        }
        const journals = await JournalService.GetJournalForReviewer();
        res.json(journals);
    } catch (error) {
        console.error("Error in GetJournalForReviewer controller:", error);
        next(error);
    }
}

export async function GetJournalVersions(req: Request, res: Response, next: NextFunction) {
    try {
        const journalId = req.query.journalId as string;
        if (!journalId) {
            throw new AppError("กรุณาระบุ JournalId", 400);
        }
        const versions = await JournalService.GetJournalVersions(journalId, (req as any).user?.userId, (req as any).user?.role);
        res.json(versions);
    } catch (error) {
        console.error("Error in GetJournalVersions controller:", error);
        next(error);
    }
}