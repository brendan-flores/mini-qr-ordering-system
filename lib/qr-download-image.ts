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
  const titleHeight = 56;
  const subtitleHeight = 32;
  const gap = 20;

  const width = qrSize + pad * 2;
  const height = pad + titleHeight + gap + qrSize + gap + subtitleHeight + pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#b80035";
  ctx.font = "bold 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, width / 2, pad + titleHeight / 2);

  const qrX = pad;
  const qrY = pad + titleHeight + gap;
  ctx.fillStyle = "#f3f6ff";
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#5c3f40";
  ctx.font = "500 18px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(
    subtitle,
    width / 2,
    qrY + qrSize + gap + subtitleHeight / 2
  );

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
