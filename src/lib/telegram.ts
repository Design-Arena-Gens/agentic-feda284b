import { TELEGRAM_ENV_VAR } from "./constants";
import type { TelegramDigestEntry } from "./types";

const TELEGRAM_API_BASE = "https://api.telegram.org";

function ensureToken(): string {
  const token = process.env[TELEGRAM_ENV_VAR];
  if (!token) {
    throw new Error(
      `${TELEGRAM_ENV_VAR} is not set. Telegram features require a bot token with read access to permitted channels.`,
    );
  }
  return token;
}

function buildTelegramUrl(token: string, endpoint: string): string {
  return `${TELEGRAM_API_BASE}/bot${token}/${endpoint}`;
}

export function formatTelegramDigest(entries: TelegramDigestEntry[]): string {
  if (entries.length === 0) {
    return "\u26a0\ufe0f No new opportunities matched your filters in the latest aggregation.";
  }

  const intro = `\ud83d\udce2 Scholarship & Internship Digest (Algeria)\n\n`;
  const body = entries
    .map((entry, index) => {
      const published = entry.publishedAt
        ? new Date(entry.publishedAt).toLocaleDateString()
        : "Recently posted";
      return [
        `${index + 1}. ${entry.title}`,
        `Type: ${entry.opportunityType === "scholarship" ? "Scholarship" : "Internship"}`,
        `Source: ${entry.sourceName}`,
        `Published: ${published}`,
        `${entry.summary}`,
        `\u27a1\ufe0f ${entry.url}`,
      ].join("\n");
    })
    .join("\n\n");

  const outro = `\n\n\ud83d\udccc Bookmark https://agentic-feda284b.vercel.app for advanced filters.`;
  return `${intro}${body}${outro}`;
}

export async function sendTelegramDigest(chatId: string, entries: TelegramDigestEntry[]) {
  const token = ensureToken();
  const text = formatTelegramDigest(entries);
  const response = await fetch(buildTelegramUrl(token, "sendMessage"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export interface TelegramUpdateOptions {
  offset?: number;
  limit?: number;
  timeout?: number;
}

export async function fetchTelegramUpdates(options: TelegramUpdateOptions = {}) {
  const token = ensureToken();
  const url = new URL(buildTelegramUrl(token, "getUpdates"));
  if (options.offset) url.searchParams.set("offset", String(options.offset));
  if (options.limit) url.searchParams.set("limit", String(options.limit));
  if (options.timeout) url.searchParams.set("timeout", String(options.timeout));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Telegram getUpdates failed: ${response.status}`);
  }

  return response.json();
}

export async function getTelegramWebhookInfo() {
  const token = ensureToken();
  const response = await fetch(buildTelegramUrl(token, "getWebhookInfo"));
  if (!response.ok) {
    throw new Error(`Telegram getWebhookInfo failed: ${response.status}`);
  }

  return response.json();
}
