import pool from "../config/database.js";
import { AppError } from "../errors/AppError.js";
import { UserStatus, Verify2FAType } from "../module/Enum.js";
import type { LoginResponseData } from "../module/LoginResponseData.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { ENV } from "../config/env.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function SendVerifyEmail(email: string, token: string) {
    const sqlCoreMailPassword = await pool.query(
        "select * from jn.configuration where code = 'CoreMailPassword'"
    );
    const CoreMailPassword = sqlCoreMailPassword.rows[0].value;

    const sqlCoreMailUser = await pool.query(
        "select * from jn.configuration where code = 'CoreMailUser'"
    );
    const CoreMailUser = sqlCoreMailUser.rows[0].value;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: CoreMailUser,
            pass: CoreMailPassword
        }
    });

    const verification_link = `${ENV.CLIENT_URL}/${token}`;
    const replacements: MailTemplateReplacements = {
        header: `<h1 class="logo">SafeTrade</h1>
                 <p style="margin: 10px 0 0; opacity: 0.8; font-weight: 300;">Safe & Secure Computer Marketplace</p>`,
        description: `<h2 class="welcome-text">ยืนยันที่อยู่อีเมลของคุณ</h2>
                      <p class="description">
                            ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับ SafeTrade!<br>
                            อีกเพียงขั้นตอนเดียวเท่านั้น เพื่อเริ่มการซื้อขายที่ปลอดภัย<br>
                            โปรดคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ
                      </p>`,
        body: `<div class="btn-container">
                    <a href="${verification_link}" class="btn">ยืนยันอีเมลของฉัน</a>
                </div>
                <p style="font-size: 14px; color: #9ca3af;">
                    หากปุ่มด้านบนใช้งานไม่ได้ โปรดคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:<br>
                    <a href="${verification_link}"
                        style="color: #059669; word-break: break-all;">${verification_link}</a>
                </p>

                <div class="security-note">
                    <strong>ข้อควรระวัง:</strong> หากคุณไม่ได้เป็นผู้สร้างบัญชีนี้
                    โปรดเพิกเฉยต่ออีเมลฉบับนี้ หรือติดต่อฝ่ายสนับสนุนหากมีข้อสงสัย
                </div>`
    }
    var html = GetMailTemplate("verify-email", replacements);

    await transporter.sendMail({
        from: `"Support Safe Trade" <${CoreMailUser}>`,
        to: email,
        subject: "ยืนยันอีเมลของคุณ",
        html: html
    });
}

export async function VerifyEmail(token: string) {
    const result = await pool.query("SELECT id, verify_token_expire FROM jn.users WHERE verify_token = $1", [token]);
    if (result.rows.length === 0) {
        throw new AppError("ลิงก์ยืนยันอีเมลไม่ถูกต้อง", 400);
    }

    const user = result.rows[0];
    const now = new Date();
    if (user.verify_token_expire < now) {
        await pool.query("DELETE FROM jn.users WHERE id = $1", [user.id]);
        throw new AppError("ลิงก์ยืนยันอีเมลหมดอายุแล้ว กรุณาสมัครสมาชิกใหม่", 400);
    }

    await pool.query(`UPDATE jn.users SET status = '${UserStatus.ACTIVE}', verify_token = null, verify_token_expire = null WHERE id = $1`, [user.id]);
}

export async function SignJWT(user: any) {
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            userStatus: user.status,
            isEnabled2FA: user.twofa_enabled,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
        },
        ENV.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const loginResponseData: LoginResponseData = {
        JWT: token
    };

    return loginResponseData;
}

function GetMailTemplate(templateName: string, replacements: MailTemplateReplacements) {
    const templatePath = path.join(__dirname, "../mail-templates", `${templateName}.html`);
    let html = fs.readFileSync(templatePath, "utf8");
    html = html.replaceAll("{{header}}", replacements.header);
    html = html.replaceAll("{{description}}", replacements.description);
    html = html.replaceAll("{{body}}", replacements.body);

    return html;
}

interface MailTemplateReplacements {
    header: string;
    description: string;
    body: string;
}