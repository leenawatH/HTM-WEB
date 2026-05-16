// TEMPORARY diagnostic route — remove after debugging the Vercel DB error.
// Reports the shape of DATABASE_URL (password masked) and the real
// connection error so we can see what production actually sees.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const raw = process.env.DATABASE_URL;

  const env: Record<string, unknown> = {
    present: typeof raw === "string",
    length: raw?.length ?? 0,
    hasSurroundingQuotes:
      !!raw && (raw.startsWith('"') || raw.startsWith("'")),
    hasWhitespaceEnds: !!raw && raw !== raw.trim(),
  };

  if (raw) {
    try {
      const u = new URL(raw.trim().replace(/^['"]|['"]$/g, ""));
      env.protocol = u.protocol;
      env.host = u.hostname;
      env.port = u.port;
      env.username = u.username; // safe — not the password
      env.database = u.pathname;
      env.searchParams = u.search;
    } catch (e) {
      env.urlParseError = (e as Error).message;
    }
  }

  let db: Record<string, unknown>;
  try {
    const rows = await prisma.$queryRaw`select 1 as ok`;
    db = { ok: true, rows };
  } catch (e) {
    const err = e as Error & { code?: string; cause?: unknown };
    db = {
      ok: false,
      name: err.name,
      code: err.code,
      message: err.message,
      cause:
        err.cause instanceof Error
          ? { name: err.cause.name, message: err.cause.message }
          : err.cause,
    };
  }

  return NextResponse.json({ env, db }, { status: db.ok ? 200 : 500 });
}
