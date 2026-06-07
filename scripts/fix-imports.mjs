import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const replacements = [
  ["@/schemas/order.schemas.js", "@/schemas/order.schemas.js"],
  ["@/lib/client/api/orders", "@/lib/client/api/orders"],
  ["@/lib/client/api/pay-order", "@/lib/client/api/pay-order"],
  ["@/lib/client/api/order-history-fetch", "@/lib/client/api/order-history-fetch"],
  ["@/lib/client/api/products", "@/lib/client/api/products"],
  ["@/lib/shared/orders/order-rules", "@/lib/shared/orders/order-rules"],
  ["@/lib/client/checkout/checkout-url", "@/lib/client/checkout/checkout-url"],
  ["@/lib/client/checkout/gcash-payment-flow", "@/lib/client/checkout/gcash-payment-flow"],
  ["@/lib/shared/orders/order-rules", "@/lib/shared/orders/order-rules"],
  ["@/lib/client/api/pay-order", "@/lib/client/api/pay-order"],
  ["from \"@/lib/shared/orders/order-rules\"", "from \"@/lib/shared/orders/order-rules\""],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(root)) {
  if (file.includes("scripts/fix-imports.mjs")) continue;
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log(`fixed ${path.relative(root, file)}`);
  }
}
