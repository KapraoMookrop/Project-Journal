import { UserRole, UserStatus } from "./Enum.js";
import type { UserInfoData } from "./UserInfoData.js";

export interface SignUpDataRequest {
    Email: string;
    Password: string;
    UserInfo: UserInfoData;
}
