import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

/** Supports MYSQL_* and Railway’s MYSQLHOST / MYSQLUSER / … names. */
function mysqlEnv(primary: string, railway?: string): string | undefined {
  const v = process.env[primary]?.trim();
  if (v) return v;
  if (railway) return process.env[railway]?.trim();
  return undefined;
}

/** Railway `MYSQL_PUBLIC_URL` — required for Vercel (not `mysql.railway.internal`). */
function fromMysqlPublicUrl():
  | {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    }
  | undefined {
  const raw = process.env["MYSQL_PUBLIC_URL"]?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(
      raw.startsWith("mysql://") ? raw : `mysql://${raw.replace(/^\/\//, "")}`
    );
    const database = url.pathname.replace(/^\//, "");
    if (!url.hostname || !database) return undefined;
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
    };
  } catch {
    return undefined;
  }
}

const RAILWAY_PRIVATE_HOST = "mysql.railway.internal";

export function getMysqlSettings() {
  const pub = fromMysqlPublicUrl();
  let host = mysqlEnv("MYSQL_HOST", "MYSQLHOST") ?? pub?.host;
  if (host === RAILWAY_PRIVATE_HOST && pub?.host) {
    host = pub.host;
  }

  const port = Number(
    mysqlEnv("MYSQL_PORT", "MYSQLPORT") || pub?.port || 3306
  );
  const user = mysqlEnv("MYSQL_USER", "MYSQLUSER") ?? pub?.user;
  const password =
    mysqlEnv("MYSQL_PASSWORD", "MYSQLPASSWORD") ?? pub?.password ?? "";
  const database =
    mysqlEnv("MYSQL_DATABASE", "MYSQLDATABASE") ?? pub?.database;
  const hostIsRailwayPublic =
    Boolean(host?.includes(".rlwy.net")) ||
    Boolean(host?.includes(".railway.app"));
  const ssl =
    process.env["MYSQL_SSL"]?.trim() === "true" || hostIsRailwayPublic;

  return { host, port, user, password, database, ssl, hostIsRailwayPublic };
}

export function assertMysqlHostReachable(): void {
  const { host } = getMysqlSettings();
  if (host === RAILWAY_PRIVATE_HOST) {
    throw new Error(
      "MYSQL_HOST is mysql.railway.internal (Railway private network). Vercel cannot reach it. In Railway → MySQL → Connect, enable Public networking and set MYSQL_HOST to the public host, or set MYSQL_PUBLIC_URL on Vercel."
    );
  }
}

export function isMysqlConfigured(): boolean {
  const { host, user, database } = getMysqlSettings();
  return Boolean(host && user && database);
}

export function mysqlConfigError(): string {
  return "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE (or Railway MYSQLHOST, MYSQLUSER, …), then run mysql/schema.sql.";
}

export function getPool(): Pool {
  if (!isMysqlConfigured()) {
    throw new Error(mysqlConfigError());
  }
  assertMysqlHostReachable();

  if (!pool) {
    const { host, port, user, password, database, ssl, hostIsRailwayPublic } =
      getMysqlSettings();

    if (hostIsRailwayPublic && port === 3306) {
      console.warn(
        "[mysql] Railway public host with port 3306 — use the TCP proxy port from Railway Connect (often 5 digits), not 3306."
      );
    }

    pool = mysql.createPool({
      host: host!,
      port,
      user: user!,
      password,
      database: database!,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 15_000,
      ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }

  return pool;
}

type QueryParam = string | number | boolean | Date | null | Buffer;

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: QueryParam[] = []
): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}
