import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { getPrimaryLanIpv4 } from "./local-network-ip.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = process.env.PORT?.trim() || "3000";
const lanIp = getPrimaryLanIpv4();

await import("./ensure-env-local.mjs");

const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

function rewriteOutput(chunk) {
  if (!lanIp) return chunk;
  const text = chunk.toString();
  return text
    .replaceAll(`http://0.0.0.0:${port}`, `http://${lanIp}:${port}`)
    .replaceAll(`0.0.0.0:${port}`, `${lanIp}:${port}`);
}

const child = spawn(
  process.execPath,
  [nextCli, "dev", "--webpack", "-H", "0.0.0.0", "-p", port],
  {
    cwd: root,
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  }
);

child.stdout.on("data", (data) => process.stdout.write(rewriteOutput(data)));
child.stderr.on("data", (data) => process.stderr.write(rewriteOutput(data)));

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
