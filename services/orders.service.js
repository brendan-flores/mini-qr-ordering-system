import { randomUUID } from "node:crypto";
import "../config/env.js";
import { getMysqlConfig, mysqlQuery } from "../config/mysql.js";

const ORDER_SELECT = `id, items, total_amount, payment_method, payment_status,
  table_number, service_type, order_status, created_at, client_device_id`;

function mapOrderRow(row) {
  const items =
    typeof row.items === "string" ? JSON.parse(row.items) : row.items;
  return {
    id: row.id,
    items,
    total_amount: Number(row.total_amount),
    payment_method: row.payment_method,
    payment_status: row.payment_status,
    table_number: row.table_number ?? null,
    service_type: row.service_type ?? "dine_in",
    order_status: row.order_status ?? "received",
    client_device_id: row.client_device_id ?? null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function createOrder({
  items,
  total_amount,
  payment_method = "cod",
  payment_status,
  table_number = null,
  service_type = "dine_in",
}) {
  if (!getMysqlConfig().isConfigured) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }

  const status =
    payment_status ?? (payment_method === "cod" ? "Pending" : "Paid");
  const id = randomUUID();

  await mysqlQuery(
    `INSERT INTO orders (
      id, items, total_amount, payment_method, payment_status,
      table_number, service_type, order_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'received')`,
    [
      id,
      JSON.stringify(items),
      total_amount,
      payment_method,
      status,
      table_number,
      service_type,
    ]
  );

  const rows = await mysqlQuery(
    `SELECT ${ORDER_SELECT} FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );
  return mapOrderRow(rows[0]);
}

export async function listOrders() {
  if (!getMysqlConfig().isConfigured) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }

  const rows = await mysqlQuery(
    `SELECT ${ORDER_SELECT} FROM orders ORDER BY created_at DESC`
  );
  return rows.map(mapOrderRow);
}

export async function updateOrderPaymentStatus({ id, payment_status }) {
  if (!getMysqlConfig().isConfigured) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
    );
  }

  await mysqlQuery(`UPDATE orders SET payment_status = ? WHERE id = ?`, [
    payment_status,
    id,
  ]);

  const rows = await mysqlQuery(
    `SELECT ${ORDER_SELECT} FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) throw new Error("Order not found");
  return mapOrderRow(rows[0]);
}
