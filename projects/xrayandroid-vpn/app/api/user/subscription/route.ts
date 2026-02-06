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
  const payments = db
    .prepare(
      "SELECT id, amount_cents, currency, status, created_at, card_last4, card_brand FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5"
    )
    .all(user?.id) as Record<string, unknown>[];

  const latestPayment = payments[0];

  return NextResponse.json({
    plan: user?.plan,
    status: user?.plan === "free" ? "free" : "active",
    startDate: user?.plan_started_at ?? null,
    currentPeriodEnd: user?.plan_expires_at ?? null,
    cancelAtPeriodEnd: Boolean(user?.plan_cancel_at_period_end),
    paymentMethod: latestPayment
      ? {
          type: "card",
          last4: latestPayment.card_last4 ?? "4242",
          brand: latestPayment.card_brand ?? "visa",
          expiryMonth: 12,
          expiryYear: 2025,
        }
      : null,
    invoices: payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount_cents,
      currency: payment.currency,
      status: payment.status,
      date: payment.created_at,
    })),
  });
}
