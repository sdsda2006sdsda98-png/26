import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadPort() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env"), "utf8");
    const portLine = envFile
      .split(/\r?\n/)
      .find((line) => line.trim().startsWith("PORT="));

    if (!portLine) return 4173;
    return Number(portLine.split("=").slice(1).join("=").trim()) || 4173;
  } catch {
    return 4173;
  }
}

function findWindowsPidByPort(port) {
  const output = execFileSync("netstat.exe", ["-ano", "-p", "tcp"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });

  const escapedPort = String(port).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s*TCP\\s+\\S+:${escapedPort}\\s+\\S+\\s+LISTENING\\s+(\\d+)\\s*$`, "mi");
  const match = output.match(pattern);

  return match ? Number(match[1]) : null;
}

const port = loadPort();

if (process.platform !== "win32") {
  process.exit(0);
}

const pid = findWindowsPidByPort(port);

if (!pid || pid === process.pid) {
  process.exit(0);
}

console.log(`Stopping existing dev server on port ${port} with PID ${pid}`);
execFileSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
  stdio: ["ignore", "ignore", "ignore"]
});
