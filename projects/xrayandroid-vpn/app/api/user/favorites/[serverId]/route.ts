import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireUser } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  context: { params: { serverId: string } }
) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  db.prepare(
    "DELETE FROM user_favorite_servers WHERE user_id = ? AND server_id = ?"
  ).run(user?.id, context.params.serverId);

  return NextResponse.json({ success: true });
}
