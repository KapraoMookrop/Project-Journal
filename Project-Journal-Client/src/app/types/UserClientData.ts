import { UserRole, UserStatus } from "./Enum";

export interface UserClientData {
    Name: string;
    SurName: string;
    Email: string;
    Phone: string;
    Role: UserRole;
    UserStatus: UserStatus;
}
