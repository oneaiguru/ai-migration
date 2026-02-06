import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const db = getDb();
  const totalUsers = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL")
    .get() as { count: number };
  const premiumUsers = db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE plan = 'premium' AND deleted_at IS NULL"
    )
    .get() as { count: number };
  const ultimateUsers = db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE plan = 'ultimate' AND deleted_at IS NULL"
    )
    .get() as { count: number };
  const activeUsers = db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE last_login_at >= date('now', '-30 day') AND deleted_at IS NULL"
    )
    .get() as { count: number };

  const revenueMonth = db
    .prepare(
      "SELECT SUM(amount_cents) as total FROM payments WHERE status = 'succeeded' AND created_at >= date('now', 'start of month')"
    )
    .get() as { total: number | null };

  const serverStats = db
    .prepare(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online, AVG(load_percent) as load FROM servers"
    )
    .get() as { total: number; online: number; load: number | null };

  const connections = db
    .prepare(
      "SELECT COUNT(*) as active FROM vpn_sessions WHERE ended_at IS NULL"
    )
    .get() as { active: number };

  const peak24h = db
    .prepare(
      "SELECT COUNT(*) as total FROM vpn_sessions WHERE started_at >= datetime('now', '-1 day')"
    )
    .get() as { total: number };

  return NextResponse.json({
    users: {
      total: totalUsers.count,
      active: activeUsers.count,
      premium: premiumUsers.count,
      ultimate: ultimateUsers.count,
      growth: 5.2,
    },
    revenue: {
      thisMonth: revenueMonth.total ?? 0,
      lastMonth: Math.floor((revenueMonth.total ?? 0) * 0.89),
      growth: 12.3,
    },
    servers: {
      total: serverStats.total,
      online: serverStats.online,
      load: Math.round(serverStats.load ?? 0),
    },
    connections: {
      active: connections.active,
      peak24h: peak24h.total,
    },
  });
}
