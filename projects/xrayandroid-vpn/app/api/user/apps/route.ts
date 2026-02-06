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
  const settings = db
    .prepare("SELECT split_tunneling_apps FROM user_settings WHERE user_id = ?")
    .get(user?.id) as { split_tunneling_apps: string } | undefined;

  const apps = JSON.parse(String(settings?.split_tunneling_apps ?? "[]"));

  return NextResponse.json({ apps });
}

export async function PUT(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const apps = Array.isArray(body.apps)
    ? body.apps.map((app: unknown) => String(app))
    : [];

  const db = getDb();
  db.prepare(
    "UPDATE user_settings SET split_tunneling_apps = ? WHERE user_id = ?"
  ).run(JSON.stringify(apps), user?.id);

  return NextResponse.json({ success: true, apps });
}
