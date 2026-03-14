import { type NextFunction, type Request, type Response } from "express";
import * as coreService from "../services/core.service.js";

export async function VerifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const { verifyToken } = req.query;
        await coreService.VerifyEmail(verifyToken as string);
        res.json({ message: "ยืนยันอีเมลสำเร็จ" });
    } catch (error) {
        next(error);
    }
}
