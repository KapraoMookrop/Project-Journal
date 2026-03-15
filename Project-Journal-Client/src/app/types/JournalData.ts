import type { JournalVersionData } from "./JournalVersionData.js";

export interface JournalData {
    Id: string;
    Title: string;
    AuthorId: string;
    Category: number;
    LastJournalVersion: JournalVersionData;
    CreatedAt: Date;
    UpdatedAt: Date;
}