function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load QR image"));
    img.src = src;
  });
}

export function tableQrDownloadLabel(tableNumber: string) {
  const table = tableNumber.trim() || "1";
  return `Table ${table}`;
}

/** PNG data URL with QR + table label for printing. */
export async function buildTableQrDownloadImage(
  qrDataUrl: string,
  tableNumber: string
): Promise<string> {
  const qrImg = await loadImage(qrDataUrl);
  const table = tableNumber.trim() || "1";
  const title = tableQrDownloadLabel(table);
  const subtitle = "Scan to order";

  const pad = 40;
  const qrSize = 360;
  const brandHeight = 24;
  const titleHeight = 48;
  const subtitleHeight = 28;
  const gap = 16;

  const width = qrSize + pad * 2;
  const height =
    pad + brandHeight + titleHeight + gap + qrSize + gap + subtitleHeight + pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  let y = pad;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.fillStyle = "#8a6b6c";
  ctx.font = "600 14px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("BRENCRAVINGS", centerX, y);
  y += brandHeight;

  ctx.fillStyle = "#b80035";
  ctx.font = "bold 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(title, centerX, y);
  y += titleHeight + gap;

  const qrX = pad;
  const qrY = y;
  ctx.fillStyle = "#f3f6ff";
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  y += qrSize + gap;

  ctx.fillStyle = "#5c3f40";
  ctx.font = "500 18px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(subtitle, centerX, y + 4);

  return canvas.toDataURL("image/png");
}

export function triggerQrPngDownload(dataUrl: string, tableNumber: string) {
  const table = tableNumber.trim() || "1";
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `brencravings-table-${table}-qr.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
