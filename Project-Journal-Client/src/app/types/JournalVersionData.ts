import type { JournalStatus } from "./Enum.js";
import type { JournalInfoData } from "./JournalInfoData.js";
import type { ReviewData } from "./ReviewData.js";

export interface JournalVersionData {
    Id: string;
    JournalId: string;
    JournalInfoData: JournalInfoData;
    ReviewData: ReviewData;
    VersionNumber: number;
    FileUrl: string;
    Status: JournalStatus;
    SubmittedAt: Date;
    UpdatedAt: Date;
}