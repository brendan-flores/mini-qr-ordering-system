import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

/** Supports MYSQL_* and Railway’s MYSQLHOST / MYSQLUSER / … names. */
function mysqlEnv(primary: string, railway?: string): string | undefined {
  const v = process.env[primary]?.trim();
  if (v) return v;
  if (railway) return process.env[railway]?.trim();
  return undefined;
}

export function getMysqlSettings() {
  return {
    host: mysqlEnv("MYSQL_HOST", "MYSQLHOST"),
    port: Number(mysqlEnv("MYSQL_PORT", "MYSQLPORT") || 3306),
    user: mysqlEnv("MYSQL_USER", "MYSQLUSER"),
    password: mysqlEnv("MYSQL_PASSWORD", "MYSQLPASSWORD") ?? "",
    database: mysqlEnv("MYSQL_DATABASE", "MYSQLDATABASE"),
    ssl: process.env["MYSQL_SSL"]?.trim() === "true",
  };
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

  if (!pool) {
    const { host, port, user, password, database, ssl } = getMysqlSettings();
    pool = mysql.createPool({
      host: host!,
      port,
      user: user!,
      password,
      database: database!,
      waitForConnections: true,
      connectionLimit: 10,
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
