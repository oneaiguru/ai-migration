import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  db.prepare("UPDATE users SET plan_cancel_at_period_end = 1 WHERE id = ?").run(
    user?.id
  );

  const updated = db
    .prepare("SELECT plan_expires_at FROM users WHERE id = ?")
    .get(user?.id) as { plan_expires_at: string } | undefined;

  return NextResponse.json({
    success: true,
    subscription: {
      status: "active",
      cancelAtPeriodEnd: true,
      currentPeriodEnd: updated?.plan_expires_at ?? null,
    },
    message: "Your subscription will remain active until the current period ends",
  });
}
