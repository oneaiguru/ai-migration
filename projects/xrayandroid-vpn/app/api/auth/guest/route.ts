import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { createToken, setAuthCookies } from "../../../../lib/auth";
import { formatDate, formatDateOnly, addDays, startOfDay } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST() {
  const db = getDb();
  const guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
  const userId = `usr_${guestId}`;
  const createdAt = new Date();

  db.prepare(
    `INSERT INTO users (
      id, email, password_hash, name, plan, plan_interval, plan_started_at,
      plan_cancel_at_period_end, is_admin, is_guest, guest_id, email_verified,
      created_at, updated_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    `${guestId}@guest.local`,
    "password123",
    null,
    "free",
    "month",
    formatDate(createdAt),
    0,
    0,
    1,
    guestId,
    0,
    formatDate(createdAt),
    formatDate(createdAt),
    formatDate(createdAt)
  );

  db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);

  db.prepare(
    `INSERT INTO usage_quotas (user_id, date, bytes_used, quota_limit)
     VALUES (?, ?, ?, ?)`
  ).run(userId, formatDateOnly(createdAt), 0, 524288000);

  const token = createToken(userId);
  const quotaResetAt = startOfDay(addDays(createdAt, 1));

  const response = NextResponse.json({
    success: true,
    guestId,
    token,
    quotaRemaining: 524288000,
    quotaResetAt: formatDate(quotaResetAt),
  });

  setAuthCookies(response, userId, token);
  return response;
}
