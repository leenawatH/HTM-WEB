import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Supabase exposes two connection poolers on the same host:
//   :5432  session pooler     — holds one DB connection per client session
//   :6543  transaction pooler — returns the connection after each statement
// Vercel runs this app as many short-lived serverless instances. With the
// session pooler, every instance pins a connection and Supabase's connection
// limit is exhausted within minutes — after which every request fails with
// `DriverAdapterError`. Force the transaction pooler, which is built for
// serverless. Same host/credentials, only the port differs.
function resolveConnectionString(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("pooler.supabase.com") && u.port === "5432") {
      u.port = "6543";
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Prisma 7 requires a driver adapter. PrismaPg connects directly to Postgres.
// `max: 1` keeps each serverless instance to a single connection — node-postgres
// defaults to 10, which multiplies across instances and exhausts the pooler.
const adapter = new PrismaPg({
  connectionString: resolveConnectionString(),
  max: 1,
  idleTimeoutMillis: 10_000,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Reuse one client across dev hot reloads and warm serverless invocations.
globalForPrisma.prisma = prisma;
