import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const favorites = db
    .prepare("SELECT server_id FROM user_favorite_servers WHERE user_id = ?")
    .all(user?.id) as { server_id: string }[];

  return NextResponse.json({
    favorites: favorites.map((row) => row.server_id),
  });
}

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const serverId = String(body.serverId || "");
  if (!serverId) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Server ID required" },
      { status: 400 }
    );
  }

  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO user_favorite_servers (user_id, server_id) VALUES (?, ?)"
  ).run(user?.id, serverId);

  return NextResponse.json({ success: true });
}
