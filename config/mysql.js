import mysql from "mysql2/promise";

let pool = null;

export function getMysqlConfig() {
  const host = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const database = process.env.MYSQL_DATABASE?.trim();
  return {
    isConfigured: Boolean(host && user && database),
    host,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user,
    password: process.env.MYSQL_PASSWORD ?? "",
    database,
  };
}

export function getMysqlPool() {
  const cfg = getMysqlConfig();
  if (!cfg.isConfigured) return null;

  if (!pool) {
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function mysqlQuery(sql, params = []) {
  const p = getMysqlPool();
  if (!p) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }
  const [rows] = await p.execute(sql, params);
  return rows;
}
