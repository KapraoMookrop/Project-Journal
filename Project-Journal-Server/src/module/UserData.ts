import type { UserRole, UserStatus } from "./Enum.js";

export interface UserData {
    Id: string;
    Email: string;
    Role: UserRole;
    Status: UserStatus;
    CreatedAt: Date;
    UpdatedAt: Date;
}