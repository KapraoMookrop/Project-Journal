import type { JournalStatus } from "./Enum.js";

export interface ReviewData {
    Id: string;
    VersionId: number;
    ReviewerId: string;
    FeedbackText: string;
    MarkedFileUrl: string;
    Decision: JournalStatus;
    ReviewedAt: Date;
}