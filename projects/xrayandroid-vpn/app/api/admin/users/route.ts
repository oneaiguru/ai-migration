import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/auth";
import { clampNumber, toNumber } from "../../../../lib/utils";

export const runtime = "nodejs";

const SORT_COLUMNS: Record<string, string> = {
  createdAt: "u.created_at",
  email: "u.email",
  lastActive: "u.last_login_at",
  plan: "u.plan",
};

export async function GET(request: Request) {
  const { error } = requireAdmin(request as any);
  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const page = clampNumber(toNumber(searchParams.get("page"), 1), 1, 1000);
  const limit = clampNumber(toNumber(searchParams.get("limit"), 20), 1, 100);
  const search = String(searchParams.get("search") || "").trim();
  const plan = String(searchParams.get("plan") || "").trim();
  const sortKey = String(searchParams.get("sort") || "createdAt");
  const order =
    String(searchParams.get("order") || "desc").toLowerCase() === "asc"
      ? "ASC"
      : "DESC";

  const sortColumn = SORT_COLUMNS[sortKey] ?? SORT_COLUMNS.createdAt;

  const whereParts: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    whereParts.push("u.email LIKE ?");
    params.push(`%${search}%`);
  }

  if (plan) {
    whereParts.push("u.plan = ?");
    params.push(plan);
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  const db = getDb();
  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM users u ${whereClause}`)
    .get(...params) as { count: number };

  const offset = (page - 1) * limit;
  const monthPrefix = new Date().toISOString().slice(0, 7);

  const users = db
    .prepare(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.plan,
        u.created_at,
        u.last_login_at,
        u.deleted_at,
        u.is_guest,
        COALESCE(usage.total, 0) as usage_this_month
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(bytes_used) as total
        FROM usage_quotas
        WHERE date LIKE ?
        GROUP BY user_id
      ) usage ON usage.user_id = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT ? OFFSET ?`
    )
    .all(`${monthPrefix}%`, ...params, limit, offset) as Record<string, unknown>[];

  return NextResponse.json({
    users: users.map((user) => {
      const deleted = Boolean(user.deleted_at);
      const isGuest = Number(user.is_guest) === 1;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        status: deleted ? "deleted" : isGuest ? "guest" : "active",
        createdAt: user.created_at,
        lastActive: user.last_login_at,
        usage: {
          thisMonth: Number(user.usage_this_month ?? 0),
        },
      };
    }),
    pagination: {
      page,
      limit,
      total: totalRow.count,
      pages: Math.max(1, Math.ceil(totalRow.count / limit)),
    },
  });
}
