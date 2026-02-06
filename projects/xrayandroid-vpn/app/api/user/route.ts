import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { requireUser, clearAuthCookies } from "../../../lib/auth";
import { formatDate } from "../../../lib/utils";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  db.prepare("UPDATE users SET deleted_at = ? WHERE id = ?").run(
    formatDate(new Date()),
    user?.id
  );

  const response = NextResponse.json({
    success: true,
    message: "Account deleted",
  });
  clearAuthCookies(response);
  return response;
}
