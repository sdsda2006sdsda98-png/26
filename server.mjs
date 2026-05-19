import { createServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

function loadEnvFile() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env"), "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env is optional; production hosts usually provide real environment variables.
  }
}

loadEnvFile();

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = createNetServer();

    probe.once("error", () => resolve(false));
    probe.once("listening", () => {
      probe.close(() => resolve(true));
    });
    probe.listen(port, "127.0.0.1");
  });
}

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    if (await isPortFree(port)) return port;
  }

  throw new Error(`No free port found from ${startPort} to ${startPort + 99}`);
}

const PORT = Number(process.env.PORT || 4173);
const DIST_DIR = join(process.cwd(), "dist");
const DEV_MODE = process.argv.includes("--dev");
const HMR_PORT = DEV_MODE
  ? Number(process.env.VITE_HMR_PORT || (await findFreePort(PORT + 20_000)))
  : null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const viteServer = DEV_MODE
  ? await import("vite").then(({ createServer: createViteServer }) =>
      createViteServer({
        appType: "custom",
        server: {
          middlewareMode: true,
          hmr: { port: HMR_PORT }
        }
      })
    )
  : null;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg"
};

function normalizeIp(ip) {
  if (!ip || ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "127.0.0.1") {
    return "127.0.0.1 (local)";
  }

  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }

  return ip;
}

function getClientIp(request) {
  const cloudflareIp = request.headers["cf-connecting-ip"];
  if (typeof cloudflareIp === "string" && cloudflareIp.trim()) {
    return normalizeIp(cloudflareIp.trim());
  }

  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return normalizeIp(realIp.trim());
  }

  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return normalizeIp(forwardedFor.split(",")[0].trim());
  }

  return normalizeIp(request.socket.remoteAddress || "unknown");
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_000) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function formatMoscowDateTime(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return value || "unknown";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Moscow"
  }).format(date);
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes ? `${minutes} мин ${seconds} сек` : `${seconds} сек`;
}

function formatTelegramMessage(event, request) {
  const payload = event.payload || {};
  const eventName =
    {
      visit: "Новый визит",
      click: "Клик на сайте",
      exit: "Пользователь ушел"
    }[event.type] || "Событие на сайте";

  const lines = [
    eventName,
    "",
    `Время: ${formatMoscowDateTime(event.time)} МСК`,
    `IP: ${getClientIp(request)}`,
    `Страница: ${event.page || "/"}`,
    `Сессия: ${payload.sessionId || "unknown"}`
  ];

  if (event.type === "visit") {
    lines.push(
      "",
      "Устройство:",
      `${payload.userAgent || request.headers["user-agent"] || "unknown"}`,
      `Экран: ${payload.screen || "unknown"}`,
      `Окно: ${payload.viewport || "unknown"}`,
      `Язык: ${payload.language || "unknown"}`,
      `Часовой пояс: ${payload.timezone || "unknown"}`
    );
  }

  if (event.type === "click") {
    lines.push(
      "",
      `Текст: ${payload.text || "unknown"}`,
      `Элемент: ${payload.tag || "unknown"}`,
      `Координаты: ${payload.x ?? "unknown"} / ${payload.y ?? "unknown"}`,
      `Окно: ${payload.viewport || "unknown"}`
    );
  }

  if (event.type === "exit") {
    lines.push(
      "",
      `Прокрутка: ${payload.scrollY ?? "unknown"}px`,
      `Время на странице: ${formatDuration(payload.durationMs)}`
    );
  }

  return lines.join("\n");
}

async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram env vars are missing; analytics event was not sent.");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${errorText}`);
  }
}

async function handleAnalytics(request, response) {
  try {
    const event = await readJsonBody(request);
    try {
      await sendTelegramMessage(formatTelegramMessage(event, request));
    } catch (error) {
      console.error("Telegram analytics send failed:", error);
    }
    response.writeHead(204);
    response.end();
  } catch (error) {
    console.error(error);
    response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Bad analytics event" }));
  }
}

async function serveStatic(request, response) {
  if (viteServer) {
    viteServer.middlewares(request, response, async () => {
      try {
        const url = new URL(request.url || "/", `http://${request.headers.host}`);
        const template = await readFile(join(process.cwd(), "index.html"), "utf8");
        const html = await viteServer.transformIndexHtml(url.pathname, template);

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        response.end(html);
      } catch (error) {
        viteServer.ssrFixStacktrace(error);
        console.error(error);
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(String(error.stack || error.message || error));
      }
    });
    return;
  }

  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(DIST_DIR, safePath);

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(file);
  } catch {
    const fallback = await readFile(join(DIST_DIR, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fallback);
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/analytics") {
    await handleAnalytics(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    await serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end();
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Close the previous dev server or run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess`);
    process.exit(1);
  }

  throw error;
});

server.listen(PORT, () => {
  console.log(`Site server is running on http://localhost:${PORT}${DEV_MODE ? ` (dev, HMR ${HMR_PORT})` : ""}`);
});
