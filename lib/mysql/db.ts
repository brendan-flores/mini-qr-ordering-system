import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

export function isMysqlConfigured(): boolean {
  return Boolean(
    process.env["MYSQL_HOST"]?.trim() &&
      process.env["MYSQL_USER"]?.trim() &&
      process.env["MYSQL_DATABASE"]?.trim()
  );
}

export function mysqlConfigError(): string {
  return "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE in .env.local, then run mysql/schema.sql.";
}

export function getPool(): Pool {
  if (!isMysqlConfigured()) {
    throw new Error(mysqlConfigError());
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env["MYSQL_HOST"]!.trim(),
      port: Number(process.env["MYSQL_PORT"]?.trim() || 3306),
      user: process.env["MYSQL_USER"]!.trim(),
      password: process.env["MYSQL_PASSWORD"] ?? "",
      database: process.env["MYSQL_DATABASE"]!.trim(),
      waitForConnections: true,
      connectionLimit: 10,
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
