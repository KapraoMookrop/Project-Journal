import pool from "../config/database.js";
import { AppError } from "../errors/AppError.js";
import { UserRole } from "../module/Enum.js";
import type { JournalData } from "../module/JournalData.js";
import type { JournalHistoryData } from "../module/JournalHistoryData.js";
import type { JournalInfoData } from "../module/JournalInfoData.js";
import type { JournalRequestData } from "../module/JournalRequestData.js";
import type { JournalVersionData } from "../module/JournalVersionData.js";
import type { ReviewData } from "../module/ReviewData.js";

export async function CreateJournal(request: JournalRequestData) {
    const { Title, AuthorId, Category, JournalVersionData } = request;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const insertJournalResult = await client.query(
            `INSERT INTO jn.journals 
                (title, author_id, category_id) 
            VALUES ($1, $2, $3) 
            RETURNING id`,
            [Title, AuthorId, Category]
        );

        const insertJournalVersionResult = await client.query(
            `INSERT INTO jn.journal_versions 
                (journal_id, version_number, file_url, status)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [insertJournalResult.rows[0].id,
            JournalVersionData.VersionNumber,
            JournalVersionData.FileUrl,
            JournalVersionData.Status]
        );

        await client.query(
            `INSERT INTO jn.journals_info 
                (version_id, abstract, keywords) 
            VALUES ($1, $2, $3)`,
            [insertJournalVersionResult.rows[0].id,
            JournalVersionData.JournalInfoData.Abstract,
            JournalVersionData.JournalInfoData.Keywords]
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw new AppError("ไม่สามารถสร้างวารสารได้ + " + error, 500);
    } finally {
        client.release();
    }
}

export async function GetMyJournals(UserId: string): Promise<JournalData[]> {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (j.id)
                j.id,
                j.title,
                j.author_id,
                j.category_id,
                j.created_at,
                j.updated_at,

                jv.id AS jv_id,
                jv.journal_id AS jv_journal_id,
                jv.version_number AS jv_version_number,
                jv.file_url AS jv_file_url,
                jv.status AS jv_status,
                jv.submitted_at AS jv_submitted_at,
                jv.updated_at AS jv_updated_at

            FROM jn.journals j
            JOIN jn.journal_versions jv
                ON j.id = jv.journal_id
            WHERE j.author_id = $1
            ORDER BY j.id, jv.version_number DESC;`,
            [UserId]
        );

        const journals: JournalData[] = result.rows.map((row) => {
            return {
                Id: row.id,
                Title: row.title,
                AuthorId: row.author_id,
                Category: row.category,
                LastJournalVersion: {
                    Id: row.jv_id,
                    JournalId: row.jv_journal_id,
                    VersionNumber: row.jv_version_number,
                    FileUrl: row.jv_file_url,
                    Status: row.jv_status,
                    SubmittedAt: row.jv_submitted_at,
                    UpdatedAt: row.jv_updated_at
                } as JournalVersionData,
                CreatedAt: row.created_at,
                UpdatedAt: row.updated_at
            };
        });

        return journals;

    } catch (error) {
        throw new AppError("ไม่สามารถดึงข้อมูลวารสารได้", 500);
    }
}

export async function GetJournalForReviewer(): Promise<JournalData[]> {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (j.id)
                j.id,
                j.title,
                j.author_id,
                j.category_id,
                j.created_at,
                j.updated_at,

                jv.id AS jv_id,
                jv.journal_id AS jv_journal_id,
                jv.version_number AS jv_version_number,
                jv.file_url AS jv_file_url,
                jv.status AS jv_status,
                jv.submitted_at AS jv_submitted_at,
                jv.updated_at AS jv_updated_at

            FROM jn.journals j
            JOIN jn.journal_versions jv
                ON j.id = jv.journal_id
            ORDER BY j.id, jv.version_number DESC;`,
        );

        const journals: JournalData[] = result.rows.map((row) => {
            return {
                Id: row.id,
                Title: row.title,
                AuthorId: row.author_id,
                Category: row.category,
                LastJournalVersion: {
                    Id: row.jv_id,
                    JournalId: row.jv_journal_id,
                    VersionNumber: row.jv_version_number,
                    FileUrl: row.jv_file_url,
                    Status: row.jv_status,
                    SubmittedAt: row.jv_submitted_at,
                    UpdatedAt: row.jv_updated_at
                } as JournalVersionData,
                CreatedAt: row.created_at,
                UpdatedAt: row.updated_at
            };
        });

        return journals;
    } catch (error) {
        throw new AppError("ไม่สามารถดึงข้อมูลวารสารได้", 500);
    }
}

export async function GetJournalVersions(JournalId: string, UserId: string, Role: UserRole): Promise<JournalVersionData[]> {
    try {

        const checkJournalResult = await pool.query("SELECT id, author_id FROM jn.journals WHERE id = $1", [JournalId]);
        if (checkJournalResult.rows.length === 0) {
            throw new AppError("ไม่พบวารสารนี้ในระบบ", 404);
        }

        if (checkJournalResult.rows[0].author_id !== UserId && Role !== UserRole.REVIEWER) {
            throw new AppError("คุณไม่มีสิทธิ์เข้าถึงวารสารนี้", 403);
        }

        const result = await pool.query(
            `SELECT 
                jv.id, jv.journal_id, jv.version_number, jv.file_url, jv.status, jv.submitted_at, jv.updated_at,
                ji.abstract, ji.keywords,
                r.id AS review_id, r.reviewer_id, r.feedback_text, r.marked_file_url, r.decision, r.reviewed_at
            FROM jn.journal_versions jv
            JOIN jn.journals_info ji ON jv.id = ji.version_id
            LEFT JOIN jn.reviews r ON jv.id = r.version_id
            WHERE jv.journal_id = $1
            ORDER BY jv.version_number DESC`,
            [JournalId]
        );

        const JournalVersions: JournalVersionData[] = result.rows.map((row) => {
            const JournalVersion: JournalVersionData = {
                Id: row.id,
                JournalId: row.journal_id,
                VersionNumber: row.version_number,
                FileUrl: row.file_url,
                Status: row.status,
                SubmittedAt: row.submitted_at,
                UpdatedAt: row.updated_at,
                JournalInfoData: {
                    Abstract: row.abstract,
                    Keywords: row.keywords
                } as JournalInfoData,
                ReviewData: row.review_id ? {
                    Id: row.review_id,
                    VersionId: row.id,
                    ReviewerId: row.reviewer_id,
                    FeedbackText: row.feedback_text,
                    MarkedFileUrl: row.marked_file_url,
                    Decision: row.decision,
                    ReviewedAt: row.reviewed_at
                } : {} as ReviewData
            } as JournalVersionData;
            return JournalVersion;
        });

        return JournalVersions;

    } catch (error : any) {
        throw new AppError("ไม่สามารถดึงข้อมูลเวอร์ชันวารสารได้ " + error.message, 500);
    }
}