import "../config/env.js";
import { getMysqlConfig, mysqlQuery } from "../config/mysql.js";

export async function listProducts() {
  if (!getMysqlConfig().isConfigured) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }

  const rows = await mysqlQuery(
    `SELECT id, name, price, category, image_url, created_at
     FROM products
     ORDER BY created_at DESC`
  );
  return rows.map((row) => ({
    ...row,
    id: String(row.id),
    price: Number(row.price),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  }));
}
