/** Shown on printable table QR assets (download PNG). */
export const TABLE_QR_ONE_DEVICE_INSTRUCTION =
  "Only one device can order at a time. To allow another device to scan and order, please close the browser or tab currently using this QR code.";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load QR image"));
    img.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function tableQrDownloadLabel(tableNumber: string) {
  const table = tableNumber.trim() || "1";
  return `Table ${table}`;
}

/** PNG data URL with QR + table label + one-device instructions for printing. */
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
  const width = qrSize + pad * 2;
  const contentWidth = width - pad * 2;

  const brandHeight = 24;
  const titleHeight = 48;
  const subtitleHeight = 26;
  const gapAfterTitle = 18;
  const gapAfterQr = 14;
  const gapAfterSubtitle = 16;

  const instructionPadX = 14;
  const instructionPadY = 12;
  const instructionLineHeight = 17;
  const instructionFont =
    "400 12px system-ui, -apple-system, Segoe UI, sans-serif";

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("Canvas not supported");
  measureCtx.font = instructionFont;
  const instructionLines = wrapCanvasText(
    measureCtx,
    TABLE_QR_ONE_DEVICE_INSTRUCTION,
    contentWidth - instructionPadX * 2
  );
  const instructionBlockHeight =
    instructionPadY * 2 + instructionLines.length * instructionLineHeight;

  const height =
    pad +
    brandHeight +
    titleHeight +
    gapAfterTitle +
    qrSize +
    gapAfterQr +
    subtitleHeight +
    gapAfterSubtitle +
    instructionBlockHeight +
    pad;

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
  y += titleHeight + gapAfterTitle;

  const qrX = pad;
  const qrY = y;
  ctx.fillStyle = "#f8f6f6";
  ctx.beginPath();
  ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
  ctx.fill();
  ctx.strokeStyle = "#eadede";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  y += qrSize + gapAfterQr;

  ctx.fillStyle = "#5c3f40";
  ctx.font = "600 17px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(subtitle, centerX, y);
  y += subtitleHeight + gapAfterSubtitle;

  const instructionX = pad;
  const instructionY = y;
  ctx.fillStyle = "#faf7f7";
  ctx.beginPath();
  ctx.roundRect(
    instructionX,
    instructionY,
    contentWidth,
    instructionBlockHeight,
    10
  );
  ctx.fill();
  ctx.strokeStyle = "#e8dcdc";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#6b5556";
  ctx.font = instructionFont;
  let textY = instructionY + instructionPadY;
  for (const line of instructionLines) {
    ctx.fillText(line, centerX, textY);
    textY += instructionLineHeight;
  }

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
