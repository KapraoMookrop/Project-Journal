import pool from "../config/database.js";
import bcrypt from "bcrypt";
import { type SignUpDataRequest } from "../module/SignUpDataRequest.js";
import { UserStatus, UserRole } from "../module/Enum.js";
import type { UUID } from "node:crypto";
import { type LoginResponseData } from "../module/LoginResponseData.js";
import { AppError } from "../errors/AppError.js";
import * as Core from "./core.service.js";
import type { LoginDataRequest } from "../module/LoginDataRequest.js";

export async function SignUp(request: SignUpDataRequest): Promise<UUID> {
  const { Email, Password, UserInfo } = request;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingEmail = await client.query(
      "SELECT id FROM jn.users WHERE email = $1",
      [Email]
    );

    if (existingEmail.rows.length > 0) {
      throw new AppError("อีเมลนี้ถูกลงทะเบียนกับระบบแล้ว", 409);
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const insertUserResult = await client.query(
      `INSERT INTO jn.users 
        (email, password_hash, role, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, verify_token`,
      [Email, hashedPassword, UserRole.AUTHOR, UserStatus.PENDING]
    );

    await client.query(
      `INSERT INTO jn.user_info 
        (user_id, prefix, name, surname, phone) 
      VALUES ($1, $2, $3, $4, $5)`,
      [
        insertUserResult.rows[0].id,
        UserInfo.Prefix,
        UserInfo.Name,
        UserInfo.SurName,
        UserInfo.Phone
      ]
    );

    await Core.SendVerifyEmail(Email, insertUserResult.rows[0].verify_token);

    await client.query("COMMIT");

    return insertUserResult.rows[0].id;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function Login(request: LoginDataRequest): Promise<LoginResponseData> {
  const { Email, Password } = request;

  const result = await pool.query(
    `SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      u.role, 
      u.status, 
      ui.name,
      ui.surname,
      ui.phone
    FROM jn.users u 
      LEFT JOIN jn.user_info ui ON u.id = ui.user_id
    WHERE u.email = $1`,
    [Email]
  );

  if (result.rows.length === 0) {
    throw new AppError("อีเมลนี้ยังไม่ได้ลงทะเบียนกับระบบ", 404);
  }

  const user = result.rows[0];

  if (user.status === UserStatus.PENDING) {
    throw new AppError("บัญชีของคุณกำลังรอการยืนยันตัวตน กรุณาเช็คอีเมลที่ได้ลงทะเบียนไว้กับระบบ", 403);
  }

  const isPasswordValid = await bcrypt.compare(Password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("รหัสผ่านไม่ถูกต้อง", 401);
  }

  const loginResponseData = await Core.SignJWT(user);

  return loginResponseData;
}

export async function CheckAlreadyExistsEmail(email: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT id FROM jn.users WHERE email = $1",
    [email]
  );

  if (result.rows.length > 0) {
    throw new AppError("อีเมลนี้ถูกลงทะเบียนกับระบบแล้ว", 409);
  }

  return false;
}