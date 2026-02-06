import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { formatDate, addDays } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();

  const db = getDb();
  const user = db
    .prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL")
    .get(email) as { id: string } | undefined;

  if (user) {
    db.prepare(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?"
    ).run(randomUUID(), formatDate(addDays(new Date(), 1)), user.id);
  }

  return NextResponse.json({
    success: true,
    message: "If this email exists, a reset link has been sent",
  });
}
