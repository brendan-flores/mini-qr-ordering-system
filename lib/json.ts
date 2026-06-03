/** Parse JSON text; returns null for empty/whitespace-only input. */
export function parseJsonText(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

/** Read request body as JSON; null if the body is empty. Throws SyntaxError if invalid. */
export async function readRequestJson(
  request: Request
): Promise<unknown | null> {
  const text = await request.text();
  const trimmed = text.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}
