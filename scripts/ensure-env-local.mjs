import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");

if (!fs.existsSync(envLocal) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envLocal);
  console.log(
    "[setup] Created .env.local from .env.example — set MYSQL_PASSWORD if needed, then run database/schema.sql."
  );
}
