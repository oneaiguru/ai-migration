import { NextResponse } from "next/server";
import { getDb } from "../../../../../lib/db";
import { requireUser } from "../../../../../lib/auth";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  db.prepare("DELETE FROM devices WHERE id = ? AND user_id = ?").run(
    context.params.id,
    user?.id
  );

  return NextResponse.json({
    success: true,
    message: "Device removed",
  });
}
