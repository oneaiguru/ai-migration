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
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .get(user?.id) as Record<string, unknown> | undefined;

  return NextResponse.json({
    id: user?.id,
    email: user?.email,
    name: user?.name,
    avatar: user?.avatar_url ?? null,
    plan: user?.plan,
    planExpiresAt: user?.plan_expires_at ?? null,
    createdAt: user?.created_at,
    settings: {
      theme: settings?.theme ?? "system",
      language: settings?.language ?? "en",
      notifications: Boolean(settings?.notifications_enabled ?? 1),
    },
  });
}

export async function PUT(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const name = body.name ? String(body.name) : null;
  const avatar = body.avatar ? String(body.avatar) : null;

  const db = getDb();
  db.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?").run(
    name,
    avatar,
    user?.id
  );

  const updated = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(user?.id) as Record<string, unknown> | undefined;

  return NextResponse.json({
    success: true,
    user: {
      id: updated?.id,
      email: updated?.email,
      name: updated?.name,
      avatar: updated?.avatar_url ?? null,
      plan: updated?.plan,
      planExpiresAt: updated?.plan_expires_at ?? null,
    },
  });
}
