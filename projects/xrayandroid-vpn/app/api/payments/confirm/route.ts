import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireUser } from "../../../../lib/auth";
import { getPlanById, getBasePlan } from "../../../../lib/plans";
import { addMonths, addDays, formatDate } from "../../../../lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, error } = requireUser(request as any);
  if (error) {
    return error;
  }

  const body = await request.json();
  const checkoutId = String(body.checkoutId || "");
  const cardNumber = String(body.paymentDetails?.cardNumber || "");

  const db = getDb();
  const payment = db
    .prepare("SELECT * FROM payments WHERE id = ?")
    .get(checkoutId) as Record<string, unknown> | undefined;

  if (!payment) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Checkout not found" },
      { status: 404 }
    );
  }

  if (cardNumber === "4000000000000002") {
    db.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").run(checkoutId);
    return NextResponse.json(
      { error: "PAYMENT_DECLINED", message: "Card declined" },
      { status: 402 }
    );
  }

  if (!cardNumber.startsWith("4")) {
    db.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").run(checkoutId);
    return NextResponse.json(
      { error: "PAYMENT_DECLINED", message: "Card declined" },
      { status: 402 }
    );
  }

  const plan = getPlanById(String(payment.plan_id));
  if (!plan) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Plan not found" },
      { status: 400 }
    );
  }

  const now = new Date();
  const periodEnd = plan.interval === "year" ? addMonths(now, 12) : addMonths(now, 1);
  const subscriptionId = `sub_${randomUUID()}`;

  db.prepare(
    "UPDATE payments SET status = 'succeeded', card_last4 = ?, card_brand = ?, receipt_url = ? WHERE id = ?"
  ).run(cardNumber.slice(-4), "visa", `/receipts/${checkoutId}`, checkoutId);

  db.prepare(
    `UPDATE users
     SET plan = ?, plan_interval = ?, plan_started_at = ?, plan_expires_at = ?,
         plan_cancel_at_period_end = 0, stripe_subscription_id = ?
     WHERE id = ?`
  ).run(
    getBasePlan(plan.id),
    plan.interval,
    formatDate(now),
    formatDate(periodEnd),
    subscriptionId,
    user?.id
  );

  return NextResponse.json({
    success: true,
    subscription: {
      id: subscriptionId,
      plan: getBasePlan(plan.id),
      status: "active",
      currentPeriodEnd: formatDate(periodEnd),
    },
    receipt: {
      id: `rcpt_${Math.random().toString(36).slice(2, 8)}`,
      amount: plan.price,
      date: formatDate(addDays(now, 0)),
    },
  });
}
