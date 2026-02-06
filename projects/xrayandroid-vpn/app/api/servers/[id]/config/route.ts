import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const db = getDb();
  const server = db
    .prepare("SELECT * FROM servers WHERE id = ?")
    .get(context.params.id) as Record<string, unknown> | undefined;

  if (!server) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Server not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    serverId: server.id,
    protocol: server.protocol,
    config: JSON.parse(String(server.config_json)),
  });
}
