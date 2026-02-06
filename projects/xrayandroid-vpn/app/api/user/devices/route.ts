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
  const devices = db
    .prepare(
      "SELECT id, name, type, last_active_at FROM devices WHERE user_id = ? ORDER BY last_active_at DESC"
    )
    .all(user?.id) as Record<string, unknown>[];

  return NextResponse.json({
    devices: devices.map((device, index) => ({
      id: device.id,
      name: device.name,
      type: device.type,
      lastActive: device.last_active_at,
      current: index === 0,
    })),
    limit: 5,
  });
}
