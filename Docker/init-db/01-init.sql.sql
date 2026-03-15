-- สคริปต์สร้างฐานข้อมูลสำหรับระบบจัดการวารสาร (รองรับ Versioning)
-- รองรับ 3 Roles: Author, Reviewer, Admin

-- 1. สร้าง Schema jn หากยังไม่มี
CREATE SCHEMA IF NOT EXISTS jn;

-- 2. สร้างส่วนขยายสำหรับ UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. สร้าง Enum
CREATE TYPE jn.user_role AS ENUM ('Author', 'Reviewer', 'Admin');
CREATE TYPE jn.user_status AS ENUM ('Pending', 'Active', 'InActive');
CREATE TYPE jn.journal_status AS ENUM ('Draft', 'Pending', 'Reviewing', 'Needs Revision', 'Approved', 'Rejected');

-- 4. ตารางผู้ใช้งานหลัก (Users)
CREATE TABLE jn.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role jn.user_role NOT NULL DEFAULT 'Author',
    status jn.user_status NOT NULL DEFAULT 'Pending',
	verify_token UUID DEFAULT gen_random_uuid(),
    verify_token_expire TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางข้อมูลส่วนตัวผู้ใช้งาน (User Info)
CREATE TABLE jn.user_info (
    user_id UUID PRIMARY KEY REFERENCES jn.users(id) ON DELETE CASCADE,
    prefix Varchar(20),
    name Varchar(255),
    surname Varchar(255),
    phone Varchar(20),
    profile_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ตารางหมวดหมู่ (Categories)
CREATE TABLE jn.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 7. ตารางวารสารหลัก (Journals)
CREATE TABLE jn.journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author_id UUID REFERENCES jn.users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES jn.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ตารางเวอร์ชันของวารสาร (Journal Versions)
CREATE TABLE jn.journal_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID REFERENCES jn.journals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    status jn.journal_status NOT NULL DEFAULT 'Draft',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(journal_id, version_number)
);

-- 9. ตารางรายละเอียดเพิ่มเติม (Journals Info)
CREATE TABLE jn.journals_info (
    version_id UUID PRIMARY KEY REFERENCES jn.journal_versions(id) ON DELETE CASCADE,
    abstract TEXT,
    keywords TEXT[],
    word_count INTEGER,
    target_audience VARCHAR(255),
    language VARCHAR(50) DEFAULT 'Thai',
    content_note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. ตารางการรีวิวและข้อเสนอแนะ (Reviews)
CREATE TABLE jn.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES jn.journal_versions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES jn.users(id) ON DELETE SET NULL,
    
    feedback_text TEXT,
    marked_file_url TEXT,
    
    decision jn.journal_status NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. ตารางการแจ้งเตือน (Notifications)
CREATE TABLE jn.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES jn.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. ตารางประวัติ (Journal History)
CREATE TABLE jn.journal_history (
    id SERIAL PRIMARY KEY,
    version_id UUID REFERENCES jn.journal_versions(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES jn.users(id),
    old_status jn.journal_status,
    new_status jn.journal_status NOT NULL,
    comment TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jn.Configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(255) Not null,
	value VARCHAR(255) Not null
);

-- 13. ฟังก์ชันและ Trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION jn.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON jn.users FOR EACH ROW EXECUTE PROCEDURE jn.update_updated_at_column();
CREATE TRIGGER update_user_info_modtime BEFORE UPDATE ON jn.user_info FOR EACH ROW EXECUTE PROCEDURE jn.update_updated_at_column();
CREATE TRIGGER update_journals_modtime BEFORE UPDATE ON jn.journals FOR EACH ROW EXECUTE PROCEDURE jn.update_updated_at_column();
CREATE TRIGGER update_journal_versions_modtime BEFORE UPDATE ON jn.journal_versions FOR EACH ROW EXECUTE PROCEDURE jn.update_updated_at_column();
CREATE TRIGGER update_journals_info_modtime BEFORE UPDATE ON jn.journals_info FOR EACH ROW EXECUTE PROCEDURE jn.update_updated_at_column();

-- 14. Indexes
CREATE INDEX idx_users_email ON jn.users(email);
CREATE INDEX idx_journal_versions_lookup ON jn.journal_versions(journal_id, version_number);
CREATE INDEX idx_reviews_version ON jn.reviews(version_id);
CREATE INDEX idx_notifications_user_unread ON jn.notifications(user_id) WHERE is_read = FALSE;
