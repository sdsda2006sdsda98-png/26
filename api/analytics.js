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

  return normalizeIp(request.socket?.remoteAddress || "unknown");
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars are missing; analytics event was not sent.");
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${errorText}`);
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const event = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};

    try {
      await sendTelegramMessage(formatTelegramMessage(event, request));
    } catch (error) {
      console.error("Telegram analytics send failed:", error);
    }

    response.status(204).end();
  } catch (error) {
    console.error(error);
    response.status(400).json({ error: "Bad analytics event" });
  }
}
