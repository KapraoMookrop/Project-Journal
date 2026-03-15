import type { JournalStatus } from "./Enum.js";

export interface JournalHistoryData{
    VersionId: number;
    ChangeBy: string;
    OldStatus: JournalStatus;
    NewStatus: JournalStatus;
    Comment: string;
    ChangedAt: Date;
}