import { Resend } from "resend";

import { verifyTtlMinutes } from "../env";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function verifyLinkValidityLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  return `${minutes} minutes`;
}

/** Parses `StockHub <noreply@domain.com>` or plain `noreply@domain.com`. */
function parseEmailFrom(): { name?: string; email: string } | null {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return null;
  const bracket = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (bracket) {
    const name = bracket[1].replace(/^["']|["']$/g, "").trim();
    const email = bracket[2].trim();
    if (email.includes("@")) {
      return { name: name || undefined, email };
    }
    return null;
  }
  if (raw.includes("@")) return { email: raw };
  return null;
}

function brevoApiKey(): string | undefined {
  return process.env.BREVO_API_KEY?.trim() || undefined;
}

function resendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

/** When `brevo`, never use Resend (avoids stray RESEND_API_KEY in OS env). */
function mailProvider(): "brevo" | "resend" | "auto" {
  const p = process.env.MAIL_PROVIDER?.trim().toLowerCase();
  if (p === "brevo" || p === "resend") return p;
  return "auto";
}

export function isMailConfigured(): boolean {
  const sender = parseEmailFrom();
  if (!sender) return false;
  const mode = mailProvider();
  if (mode === "brevo") return Boolean(brevoApiKey());
  if (mode === "resend") return Boolean(resendApiKey());
  return Boolean(brevoApiKey() || resendApiKey());
}

function verificationEmailHtml(verifyUrl: string): string {
  const ttl = verifyLinkValidityLabel(verifyTtlMinutes());
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
    <p>Confirm your email for StockHub by opening the link below (link valid for ${ttl}):</p>
    <p><a href="${verifyUrl}" style="color:#18181b;">Verify my email</a></p>
    <p style="font-size:12px;color:#71717a;">If you did not sign up, you can ignore this message.</p>
  </body>
</html>`;
}

function verificationEmailText(verifyUrl: string): string {
  const ttl = verifyLinkValidityLabel(verifyTtlMinutes());
  return `Open this link to verify your email (link valid for ${ttl}): ${verifyUrl}\n\nIf you did not sign up for StockHub, ignore this message.`;
}

async function sendViaBrevoMessage(
  to: string,
  subject: string,
  html: string,
  text: string,
  sender: { name?: string; email: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = brevoApiKey();
  if (!key) return { ok: false, message: "BREVO_API_KEY missing" };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      sender: {
        name: sender.name ?? "StockHub",
        email: sender.email,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string; error?: unknown };
      if (typeof body.message === "string") message = body.message;
    } catch {
      /* ignore */
    }
    return { ok: false, message };
  }
  return { ok: true };
}

async function sendViaResendMessage(
  to: string,
  subject: string,
  html: string,
  text: string,
  sender: { name?: string; email: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = resendApiKey();
  if (!key) return { ok: false, message: "RESEND_API_KEY missing" };

  const fromDisplay = sender.name
    ? `${sender.name} <${sender.email}>`
    : sender.email;

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: fromDisplay,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const sender = parseEmailFrom();
  if (!sender) {
    return { ok: false, message: "EMAIL_FROM missing or invalid" };
  }

  const mode = mailProvider();
  if (mode === "brevo" || (mode === "auto" && brevoApiKey())) {
    return sendViaBrevoMessage(
      params.to,
      params.subject,
      params.html,
      params.text,
      sender,
    );
  }
  if (mode === "resend" || (mode === "auto" && resendApiKey())) {
    return sendViaResendMessage(
      params.to,
      params.subject,
      params.html,
      params.text,
      sender,
    );
  }
  return { ok: false, message: "No mail API key for selected MAIL_PROVIDER" };
}

async function sendViaBrevo(
  to: string,
  verifyUrl: string,
  sender: { name?: string; email: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return sendViaBrevoMessage(
    to,
    "Verify your StockHub email",
    verificationEmailHtml(verifyUrl),
    verificationEmailText(verifyUrl),
    sender,
  );
}

async function sendViaResend(
  to: string,
  verifyUrl: string,
  sender: { name?: string; email: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return sendViaResendMessage(
    to,
    "Verify your StockHub email",
    verificationEmailHtml(verifyUrl),
    verificationEmailText(verifyUrl),
    sender,
  );
}

/**
 * Sends verification email. Set `MAIL_PROVIDER=brevo` or `resend`; if unset, uses Brevo when key exists else Resend.
 */
export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sender = parseEmailFrom();
  if (!sender) {
    return { ok: false, message: "EMAIL_FROM missing or invalid" };
  }

  const mode = mailProvider();
  if (mode === "brevo" || (mode === "auto" && brevoApiKey())) {
    return sendViaBrevo(to, verifyUrl, sender);
  }
  if (mode === "resend" || (mode === "auto" && resendApiKey())) {
    return sendViaResend(to, verifyUrl, sender);
  }
  return { ok: false, message: "No mail API key for selected MAIL_PROVIDER" };
}
