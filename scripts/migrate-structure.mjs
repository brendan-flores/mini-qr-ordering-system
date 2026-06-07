import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const moves = [
  ["client/services/api.ts", "lib/client/api/api.ts"],
  ["client/services/orders.ts", "lib/client/api/orders.ts"],
  ["client/services/products.ts", "lib/client/api/products.ts"],
  ["client/services/payOrder.ts", "lib/client/api/pay-order.ts"],
  ["client/services/order-history.ts", "lib/client/api/order-history.ts"],
  ["client/services/order-history-fetch.ts", "lib/client/api/order-history-fetch.ts"],
  ["client/services/qr-sessions.ts", "lib/client/api/qr-sessions.ts"],
  ["components/cart/cartStorage.ts", "lib/client/cart/cart-storage.ts"],
  ["components/cart/cartUtils.ts", "lib/client/cart/cart-utils.ts"],
  ["components/cart/cartTypes.ts", "lib/client/cart/cart-types.ts"],
  ["components/admin/adminUtils.ts", "lib/client/admin/admin-utils.ts"],
  ["components/orders/useActiveOrderCount.ts", "hooks/useActiveOrderCount.ts"],
  ["lib/mysql/db.ts", "lib/server/db/db.ts"],
  ["lib/mysql/map-order.ts", "lib/server/db/map-order.ts"],
  ["lib/mysql/products.ts", "lib/server/db/products.ts"],
  ["lib/mysql/qr-access-bindings.ts", "lib/server/db/qr-access-bindings.ts"],
  ["lib/mysql/qr-access-revocations.ts", "lib/server/db/qr-access-revocations.ts"],
  ["lib/mysql/table-qr-tokens.ts", "lib/server/db/table-qr-tokens.ts"],
  ["lib/mysql/device-awaiting-orders.ts", "lib/server/db/device-awaiting-orders.ts"],
  ["lib/orders/order-service.ts", "lib/server/services/order-service.ts"],
  ["lib/orders/db-errors.ts", "lib/server/services/db-errors.ts"],
  ["lib/admin-auth.ts", "lib/server/auth/admin-auth.ts"],
  ["lib/admin-session.ts", "lib/server/auth/admin-session.ts"],
  ["lib/admin-users.ts", "lib/server/auth/admin-users.ts"],
  ["lib/qr-order-session.ts", "lib/server/qr/qr-order-session.ts"],
  ["lib/qr-order-activate.ts", "lib/server/qr/qr-order-activate.ts"],
  ["lib/qr-order-end-session.ts", "lib/server/qr/qr-order-end-session.ts"],
  ["lib/qr-order-guard.ts", "lib/server/qr/qr-order-guard.ts"],
  ["lib/qr-resolve-access.ts", "lib/server/qr/qr-resolve-access.ts"],
  ["lib/table-qr-access.ts", "lib/server/qr/table-qr-access.ts"],
  ["lib/qr-session-inactivity-policy.ts", "lib/server/qr/qr-session-inactivity-policy.ts"],
  ["lib/qr-binding-abandoned.ts", "lib/server/qr/qr-binding-abandoned.ts"],
  ["lib/qr-binding-inactivity.ts", "lib/server/qr/qr-binding-inactivity.ts"],
  ["lib/qr-admin-session-status.ts", "lib/server/qr/qr-admin-session-status.ts"],
  ["lib/qr-session-client.ts", "lib/client/qr/qr-session-client.ts"],
  ["lib/qr-session-end.ts", "lib/client/qr/qr-session-end.ts"],
  ["lib/qr-session-flow.ts", "lib/client/qr/qr-session-flow.ts"],
  ["lib/qr-download-image.ts", "lib/client/qr/qr-download-image.ts"],
  ["lib/qr-inactivity.ts", "lib/client/qr/qr-inactivity.ts"],
  ["lib/ordering-activity.ts", "lib/client/qr/ordering-activity.ts"],
  ["lib/ordering-inactivity-suspend.ts", "lib/client/qr/ordering-inactivity-suspend.ts"],
  ["lib/ordering-inactivity-suspend-state.ts", "lib/client/qr/ordering-inactivity-suspend-state.ts"],
  ["lib/table.ts", "lib/client/session/table.ts"],
  ["lib/admin-qr-table.ts", "lib/client/session/admin-qr-table.ts"],
  ["lib/checkout-url.ts", "lib/client/checkout/checkout-url.ts"],
  ["lib/gcash-payment-flow.ts", "lib/client/checkout/gcash-payment-flow.ts"],
  ["lib/order-events.ts", "lib/client/orders/order-events.ts"],
  ["lib/order-receipt-pdf.ts", "lib/client/orders/order-receipt-pdf.ts"],
  ["lib/device-id.ts", "lib/client/device/device-id.ts"],
  ["lib/device-session.ts", "lib/client/device/device-session.ts"],
  ["lib/routes.ts", "lib/shared/config/routes.ts"],
  ["lib/app-hosts.ts", "lib/shared/config/app-hosts.ts"],
  ["lib/qr-order-env.ts", "lib/shared/config/qr-order-env.ts"],
  ["lib/dev-allowed-origins.ts", "lib/shared/config/dev-allowed-origins.ts"],
  ["lib/lan-ip.ts", "lib/shared/config/lan-ip.ts"],
  ["lib/orders/order-rules.ts", "lib/shared/orders/order-rules.ts"],
  ["lib/customer-order-flow.ts", "lib/shared/orders/customer-order-flow.ts"],
  ["lib/kitchen-step-progress.ts", "lib/shared/orders/kitchen-step-progress.ts"],
  ["lib/order-polling.ts", "lib/shared/orders/order-polling.ts"],
  ["lib/product-images.ts", "lib/shared/products/product-images.ts"],
  ["lib/product-descriptions.ts", "lib/shared/products/product-descriptions.ts"],
  ["lib/brand.ts", "lib/shared/products/brand.ts"],
  ["lib/json.ts", "lib/shared/utils/json.ts"],
  ["lib/ui-motion.ts", "lib/shared/utils/ui-motion.ts"],
  ["database/schema.sql", "database/schema.sql"],
];

const replacements = [
  ["@/lib/server/db/", "@/lib/server/db/"],
  ["@/lib/server/auth/admin-auth", "@/lib/server/auth/admin-auth"],
  ["@/lib/server/auth/admin-session", "@/lib/server/auth/admin-session"],
  ["@/lib/server/auth/admin-users", "@/lib/server/auth/admin-users"],
  ["@/lib/server/services/order-service", "@/lib/server/services/order-service"],
  ["@/lib/server/services/db-errors", "@/lib/server/services/db-errors"],
  ["@/lib/server/qr/qr-order-session", "@/lib/server/qr/qr-order-session"],
  ["@/lib/server/qr/qr-order-activate", "@/lib/server/qr/qr-order-activate"],
  ["@/lib/server/qr/qr-order-end-session", "@/lib/server/qr/qr-order-end-session"],
  ["@/lib/server/qr/qr-order-guard", "@/lib/server/qr/qr-order-guard"],
  ["@/lib/server/qr/qr-resolve-access", "@/lib/server/qr/qr-resolve-access"],
  ["@/lib/server/qr/table-qr-access", "@/lib/server/qr/table-qr-access"],
  ["@/lib/server/qr/qr-session-inactivity-policy", "@/lib/server/qr/qr-session-inactivity-policy"],
  ["@/lib/server/qr/qr-binding-abandoned", "@/lib/server/qr/qr-binding-abandoned"],
  ["@/lib/server/qr/qr-binding-inactivity", "@/lib/server/qr/qr-binding-inactivity"],
  ["@/lib/server/qr/qr-admin-session-status", "@/lib/server/qr/qr-admin-session-status"],
  ["@/lib/client/session/table", "@/lib/client/session/table"],
  ["@/lib/client/device/device-session", "@/lib/client/device/device-session"],
  ["@/lib/client/device/device-id", "@/lib/client/device/device-id"],
  ["@/lib/client/qr/qr-session-client", "@/lib/client/qr/qr-session-client"],
  ["@/lib/client/qr/qr-session-end", "@/lib/client/qr/qr-session-end"],
  ["@/lib/client/qr/qr-session-flow", "@/lib/client/qr/qr-session-flow"],
  ["@/lib/client/qr/qr-download-image", "@/lib/client/qr/qr-download-image"],
  ["@/lib/client/qr/qr-inactivity", "@/lib/client/qr/qr-inactivity"],
  ["@/lib/client/qr/ordering-activity", "@/lib/client/qr/ordering-activity"],
  ["@/lib/client/qr/ordering-inactivity-suspend-state", "@/lib/client/qr/ordering-inactivity-suspend-state"],
  ["@/lib/client/qr/ordering-inactivity-suspend", "@/lib/client/qr/ordering-inactivity-suspend"],
  ["@/lib/client/checkout/checkout-url", "@/lib/client/checkout/checkout-url"],
  ["@/lib/client/checkout/gcash-payment-flow", "@/lib/client/checkout/gcash-payment-flow"],
  ["@/lib/client/orders/order-events", "@/lib/client/orders/order-events"],
  ["@/lib/client/orders/order-receipt-pdf", "@/lib/client/orders/order-receipt-pdf"],
  ["@/lib/client/session/admin-qr-table", "@/lib/client/session/admin-qr-table"],
  ["@/lib/shared/config/routes", "@/lib/shared/config/routes"],
  ["@/lib/shared/config/app-hosts", "@/lib/shared/config/app-hosts"],
  ["@/lib/shared/config/qr-order-env", "@/lib/shared/config/qr-order-env"],
  ["@/lib/shared/config/dev-allowed-origins", "@/lib/shared/config/dev-allowed-origins"],
  ["@/lib/shared/config/lan-ip", "@/lib/shared/config/lan-ip"],
  ["@/lib/shared/orders/order-rules", "@/lib/shared/orders/order-rules"],
  ["@/lib/shared/orders/customer-order-flow", "@/lib/shared/orders/customer-order-flow"],
  ["@/lib/shared/orders/kitchen-step-progress", "@/lib/shared/orders/kitchen-step-progress"],
  ["@/lib/shared/orders/order-polling", "@/lib/shared/orders/order-polling"],
  ["@/lib/shared/products/product-images", "@/lib/shared/products/product-images"],
  ["@/lib/shared/products/product-descriptions", "@/lib/shared/products/product-descriptions"],
  ["@/lib/shared/products/brand", "@/lib/shared/products/brand"],
  ["@/lib/shared/utils/json", "@/lib/shared/utils/json"],
  ["@/lib/shared/utils/ui-motion", "@/lib/shared/utils/ui-motion"],
  ["@/lib/client/api/", "@/lib/client/api/"],
  ["@/lib/client/orders/order-events", "@/lib/client/orders/order-events"],
  ["@/types/product", "@/types/product"],
  ["./pay-order", "./pay-order"],
  ["@/lib/client/cart/cart-storage", "@/lib/client/cart/cart-storage"],
  ["@/lib/client/cart/cart-utils", "@/lib/client/cart/cart-utils"],
  ["@/lib/client/cart/cart-types", "@/lib/client/cart/cart-types"],
  ["@/lib/client/cart/cart-storage", "@/lib/client/cart/cart-storage"],
  ["@/lib/client/cart/cart-utils", "@/lib/client/cart/cart-utils"],
  ["@/lib/client/cart/cart-types", "@/lib/client/cart/cart-types"],
  ["@/lib/client/admin/admin-utils", "@/lib/client/admin/admin-utils"],
  ["@/lib/client/admin/admin-utils", "@/lib/client/admin/admin-utils"],
  ["@/hooks/useActiveOrderCount", "@/hooks/useActiveOrderCount"],
  ["@/hooks/useActiveOrderCount", "@/hooks/useActiveOrderCount"],
  ["@/schemas/order.schemas.js", "@/schemas/order.schemas.js"],
  ["../@/schemas/order.schemas.js", "@/schemas/order.schemas.js"],
  ["@/schemas/order.schemas.js", "@/schemas/order.schemas.js"],
  ["./lib/shared/config/dev-allowed-origins", "./lib/shared/config/dev-allowed-origins"],
  ["database/schema.sql", "database/schema.sql"],
];

const typeImportReplacements = [
  ['from "@/lib/client/api/orders"', 'from "@/types/order"'],
  ["from '@/lib/client/api/orders'", "from '@/types/order'"],
  ['from "@/lib/client/api/products"', 'from "@/types/product"'],
  ["from '@/lib/client/api/products'", "from '@/types/product'"],
  ['from "@/types/order"', 'from "@/types/order"'],
  ['from "@/types/product"', 'from "@/types/product"'],
  ['from "@/types/order"', 'from "@/types/order"'],
  ['from "@/types/product"', 'from "@/types/product"'],
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function moveFile(fromRel, toRel) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  if (!fs.existsSync(from)) {
    console.warn(`skip missing: ${fromRel}`);
    return;
  }
  ensureDir(to);
  fs.renameSync(from, to);
  console.log(`moved ${fromRel} -> ${toRel}`);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (/\.(ts|tsx|js|mjs|md)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function applyReplacements(content) {
  let next = content;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  return next;
}

console.log("=== Moving files ===");
for (const [from, to] of moves) {
  moveFile(from, to);
}

console.log("\n=== Updating imports ===");
const files = walk(root);
for (const file of files) {
  if (file.endsWith("scripts/migrate-structure.mjs")) continue;
  let content = fs.readFileSync(file, "utf8");
  let next = applyReplacements(content);
  for (const [from, to] of typeImportReplacements) {
    if (next.includes("import type") && next.includes(from)) {
      next = next.split(from).join(to);
    }
  }
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log(`updated ${path.relative(root, file)}`);
  }
}

console.log("\n=== Done ===");
