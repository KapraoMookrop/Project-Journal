//  Role ของผู้ใช้ในระบบ
export enum UserRole {
  ADMIN = "Admin",
  AUTHOR = "Author",
  REVIEWER = "Reviewer",
}

// สถานะบัญชีผู้ใช้
export enum UserStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  INACTIVE = "InActive",
}

export enum JournalStatus {
  PENDING = "Pending",
  REVIEWING = "Reviewing",
  NEEDREVISION = "Needs Revision",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

// ประเภทของการยืนยัน 2FA
export enum Verify2FAType {
  VERIFYLOGIN = "VERIFYLOGIN",
  VERIFYENABLE = "VERIFYENABLE",
}