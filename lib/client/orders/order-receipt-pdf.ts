import { jsPDF } from "jspdf";
import type { Order, OrderItem, PaymentStatusLegacy } from "@/types/order";
import {
  paymentMethodLabel,
  serviceTypeLabel,
} from "@/lib/client/api/orders";
import { BRAND_LOGO_PATH } from "@/lib/shared/products/brand";
import { customerKitchenStepLabel, shortOrderId } from "@/lib/shared/orders/customer-order-flow";

const BRAND_NAME = "BrenCravings";
const RECEIPT_SUBTITLE = "Official Order Receipt";

/** jsPDF Helvetica cannot render ₱ — use ASCII-safe "PHP 9.00" on receipts. */
function formatReceiptMoney(amount: number) {
  const n = Number(amount);
  const safe = Number.isFinite(n) && n >= 0 ? n : 0;
  return `PHP ${safe.toFixed(2)}`;
}

function paymentStatusLabel(status: PaymentStatusLegacy | undefined): string {
  if (status === "Paid" || status === "Completed") return "Paid";
  if (status === "Failed") return "Failed";
  return "Pending";
}

function formatPlacedAt(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function serviceLine(order: Order): string {
  const service = serviceTypeLabel(order.service_type ?? "dine_in");
  const table = order.table_number?.trim();
  if (table) return `${service} · Table ${table}`;
  return service;
}

type SanitizedItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

function sanitizeItem(item: OrderItem): SanitizedItem {
  const name = item.name?.trim() || "Item";
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  const unitPrice = Math.max(0, Number(item.price) || 0);
  const lineTotal = Number((unitPrice * quantity).toFixed(2));
  return { name, quantity, unitPrice, lineTotal };
}

async function loadLogoDataUrl(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const res = await fetch(BRAND_LOGO_PATH);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read logo."));
      reader.readAsDataURL(blob);
    });
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not load logo."));
      img.src = dataUrl;
    });
    if (!img.naturalWidth || !img.naturalHeight) return null;
    return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export async function downloadOrderReceipt(order: Order): Promise<void> {
  const items = (order.items ?? []).map(sanitizeItem);
  if (items.length === 0) {
    throw new Error("This order has no items to print on a receipt.");
  }

  const total = Math.max(0, Number(order.total_amount) || 0);
  const orderId = shortOrderId(order.id);
  const placedAt = formatPlacedAt(order.created_at);
  const service = serviceLine(order);
  const payment = paymentMethodLabel(
    order.payment_method,
    order.service_type ?? "dine_in"
  );
  const paymentStatus = paymentStatusLabel(order.payment_status);
  const kitchenStatus = customerKitchenStepLabel(order.order_status);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let y = 22;

  const logo = await loadLogoDataUrl();
  if (logo) {
    const logoHeight = 14;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    doc.addImage(logo.dataUrl, "PNG", marginX, y - 4, logoWidth, logoHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(BRAND_NAME, marginX + logoWidth + 4, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(RECEIPT_SUBTITLE, marginX + logoWidth + 4, y + 10);
    y += 18;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text(BRAND_NAME, marginX, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(RECEIPT_SUBTITLE, marginX, y);
    y += 10;
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  const metaRows: [string, string][] = [
    ["Order #", orderId],
    ["Date", placedAt],
    ["Service", service],
    ["Payment", `${payment} · ${paymentStatus}`],
    ["Kitchen status", kitchenStatus],
  ];

  doc.setFontSize(10);
  for (const [label, value] of metaRows) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(90, 90, 90);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const lines = wrapText(doc, value, contentWidth - 42);
    doc.text(lines, marginX + 42, y);
    y += Math.max(6, lines.length * 5);
  }

  y += 4;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Items", marginX, y);
  y += 7;

  doc.setFontSize(10);
  for (const item of items) {
    if (y > 265) {
      doc.addPage();
      y = 22;
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    const nameLines = wrapText(doc, item.name, contentWidth - 50);
    doc.text(nameLines, marginX, y);
    y += nameLines.length * 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const detail = `${item.quantity} x ${formatReceiptMoney(item.unitPrice)}`;
    doc.text(detail, marginX + 2, y);
    doc.text(formatReceiptMoney(item.lineTotal), pageWidth - marginX, y, {
      align: "right",
    });
    y += 7;
  }

  y += 2;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Total", marginX, y);
  doc.text(formatReceiptMoney(total), pageWidth - marginX, y, { align: "right" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for ordering at BrenCravings!", marginX, y);

  doc.save(`BrenCravings-Receipt-${orderId}.pdf`);
}
