import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import { getPlanById } from "../../../../lib/plans";
import { formatDate } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const planId = String(body.planId || "");
  const paymentMethod = String(body.paymentMethod || "card");

  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Invalid plan" },
      { status: 400 }
    );
  }

  const db = getDb();
  const checkoutId = `chk_${randomUUID()}`;

  db.prepare(
    `INSERT INTO payments (
      id, user_id, stripe_payment_id, amount_cents, currency, status, plan_id, payment_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    checkoutId,
    user?.id,
    checkoutId,
    plan.price,
    "usd",
    "pending",
    plan.id,
    paymentMethod,
    formatDate(new Date())
  );

  return NextResponse.json({
    checkoutId,
    clientSecret: `mock_secret_${Math.random().toString(36).slice(2, 10)}`,
    amount: plan.price,
    currency: "usd",
  });
}
