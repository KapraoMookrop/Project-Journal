import type { JournalVersionData } from "./JournalVersionData.js";

export interface JournalRequestData {
    Title: string;
    AuthorId: string;
    Category: number;
    JournalVersionData: JournalVersionData;
    CreatedAt: Date;
    UpdatedAt: Date;
}