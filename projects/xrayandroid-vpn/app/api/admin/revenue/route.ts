import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";
import { addDays, addMonths, formatDate } from "../../../../lib/utils";

export const runtime = "nodejs";

function formatMonth(date: Date) {
  return date.toISOString().slice(0, 7);
}

export async function GET(request: Request) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const period = String(searchParams.get("period") || "month");

  const now = new Date();
  let startDate = addDays(now, -30);
  let bucket: "day" | "month" = "day";
  let steps = 30;

  if (period === "day") {
    startDate = addDays(now, -1);
    steps = 2;
  } else if (period === "week") {
    startDate = addDays(now, -7);
    steps = 8;
  } else if (period === "year") {
    startDate = addMonths(now, -11);
    bucket = "month";
    steps = 12;
  }

  const db = getDb();
  const startIso = formatDate(startDate);

  const breakdownRows = db
    .prepare(
      `SELECT plan_id, SUM(amount_cents) as total
       FROM payments
       WHERE status = 'succeeded' AND created_at >= ?
       GROUP BY plan_id`
    )
    .all(startIso) as { plan_id: string; total: number }[];

  const breakdown: Record<string, number> = {
    premium_monthly: 0,
    premium_annual: 0,
    ultimate_monthly: 0,
    ultimate_annual: 0,
  };

  breakdownRows.forEach((row) => {
    breakdown[row.plan_id] = row.total ?? 0;
  });

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  const groupExpr = bucket === "month" ? "substr(created_at, 1, 7)" : "substr(created_at, 1, 10)";
  const chartRows = db
    .prepare(
      `SELECT ${groupExpr} as bucket, SUM(amount_cents) as total
       FROM payments
       WHERE status = 'succeeded' AND created_at >= ?
       GROUP BY bucket
       ORDER BY bucket`
    )
    .all(startIso) as { bucket: string; total: number }[];

  const chartMap = new Map(chartRows.map((row) => [row.bucket, row.total ?? 0]));
  const chart: { date: string; amount: number }[] = [];

  for (let i = 0; i < steps; i += 1) {
    const current = bucket === "month" ? addMonths(startDate, i) : addDays(startDate, i);
    const label = bucket === "month" ? formatMonth(current) : current.toISOString().slice(0, 10);
    chart.push({
      date: label,
      amount: chartMap.get(label) ?? 0,
    });
  }

  const totalUsers = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL")
    .get() as { count: number };
  const paidUsers = db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE plan != 'free' AND deleted_at IS NULL"
    )
    .get() as { count: number };
  const cancelUsers = db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE plan_cancel_at_period_end = 1 AND deleted_at IS NULL"
    )
    .get() as { count: number };

  const arpu = paidUsers.count > 0 ? total / paidUsers.count / 100 : 0;
  const churn = paidUsers.count > 0 ? (cancelUsers.count / paidUsers.count) * 100 : 0;
  const ltv = churn > 0 ? arpu / (churn / 100) : arpu * 12;

  return NextResponse.json({
    total,
    breakdown,
    chart,
    metrics: {
      arpu: Number(arpu.toFixed(2)),
      churn: Number(churn.toFixed(1)),
      ltv: Number(ltv.toFixed(2)),
    },
  });
}
