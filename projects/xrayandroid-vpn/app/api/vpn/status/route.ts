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
  const session = db
    .prepare(
      "SELECT * FROM vpn_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1"
    )
    .get(user?.id) as Record<string, unknown> | undefined;

  if (!session) {
    return NextResponse.json({ connected: false, session: null });
  }

  const server = db
    .prepare("SELECT name, country, city FROM servers WHERE id = ?")
    .get(session.server_id) as Record<string, unknown> | undefined;

  return NextResponse.json({
    connected: true,
    session: {
      id: session.id,
      serverId: session.server_id,
      serverName: server
        ? `${server.country} - ${server.city}`
        : session.server_id,
      startTime: session.started_at,
      duration: session.duration_seconds ?? 0,
      bytesDown: session.bytes_down ?? 0,
      bytesUp: session.bytes_up ?? 0,
    },
  });
}
