import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { createToken, setAuthCookies } from "../../../../lib/auth";
import { formatDate } from "../../../../lib/utils";
import { simpleEmailCheck } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const confirmPassword = String(body.confirmPassword || "");
  const acceptTerms = Boolean(body.acceptTerms);

  if (!simpleEmailCheck(email)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid email format" },
      { status: 400 }
    );
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Password must be at least 8 characters, include a number and uppercase letter",
      },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Passwords do not match" },
      { status: 400 }
    );
  }

  if (!acceptTerms) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "You must accept the terms" },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL")
    .get(email);

  if (existing) {
    return NextResponse.json(
      { error: "EMAIL_EXISTS", message: "Email already registered" },
      { status: 409 }
    );
  }

  const userId = `usr_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date();

  db.prepare(
    `INSERT INTO users (
      id, email, password_hash, name, plan, plan_interval, plan_started_at,
      plan_cancel_at_period_end, is_admin, is_guest, email_verified,
      created_at, updated_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    email,
    password,
    null,
    "free",
    "month",
    formatDate(createdAt),
    0,
    0,
    0,
    0,
    formatDate(createdAt),
    formatDate(createdAt),
    formatDate(createdAt)
  );

  db.prepare(
    `INSERT INTO user_settings (user_id)
     VALUES (?)`
  ).run(userId);

  const token = createToken(userId);
  const response = NextResponse.json({
    success: true,
    user: {
      id: userId,
      email,
      plan: "free",
      createdAt: formatDate(createdAt),
    },
    token,
    expiresAt: formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  });

  setAuthCookies(response, userId, token);
  return response;
}
