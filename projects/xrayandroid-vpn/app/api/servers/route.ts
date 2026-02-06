import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const premium = searchParams.get("premium");
  const tagsParam = searchParams.get("tags");

  const db = getDb();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (country) {
    clauses.push("country_code = ?");
    params.push(country.toUpperCase());
  }

  if (premium) {
    clauses.push("is_premium = ?");
    params.push(premium === "true" ? 1 : 0);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM servers ${where} ORDER BY country_code, city`)
    .all(...params) as Record<string, unknown>[];

  const tags = tagsParam ? tagsParam.split(",").map((tag) => tag.trim()) : [];

  const filtered = tags.length
    ? rows.filter((row) => {
        const serverTags = JSON.parse(String(row.tags ?? "[]"));
        return tags.every((tag) => serverTags.includes(tag));
      })
    : rows;

  return NextResponse.json({
    servers: filtered.map((row) => ({
      id: row.id,
      name: row.name,
      country: row.country,
      countryCode: row.country_code,
      city: row.city,
      ip: row.ip_address,
      port: row.port,
      protocol: row.protocol,
      load: row.load_percent,
      ping: null,
      tags: JSON.parse(String(row.tags ?? "[]")),
      premium: Boolean(row.is_premium),
      status: row.status,
    })),
    count: filtered.length,
  });
}
