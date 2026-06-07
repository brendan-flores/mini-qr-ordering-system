import type { RowDataPacket } from "mysql2";
import { query } from "./db";

export type ProductRow = {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  created_at: string;
};

function mapProduct(row: RowDataPacket): ProductRow {
  return {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    category: String(row.category),
    image_url: (row.image_url as string | null) ?? null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function listProducts(): Promise<ProductRow[]> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, price, category, image_url, created_at
     FROM products
     ORDER BY created_at DESC`
  );
  return rows.map(mapProduct);
}

export async function getProductsByIds(
  ids: string[]
): Promise<Pick<ProductRow, "id" | "name" | "price" | "image_url">[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const rows = await query<RowDataPacket[]>(
    `SELECT id, name, price, image_url FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    image_url: (row.image_url as string | null) ?? null,
  }));
}
