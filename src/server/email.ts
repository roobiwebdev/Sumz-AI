import "server-only";
import { Resend } from "resend";
import { serverEnv } from "./env";

/**
 * SOURCE OF TRUTH KEYWORDS: sendEmail, email, resend, transactional email, verification email, password reset email, escapeHtml
 * WHAT:  Sends branded transactional emails through Resend.
 * WHY:   Every email goes through one function so the sender, layout and escaping stay consistent.
 *        Without RESEND_API_KEY (local dev) the link is printed to the server console instead.
 * WHERE: src/server/auth.ts (verification and password reset).
 */
const resend = serverEnv.RESEND_API_KEY ? new Resend(serverEnv.RESEND_API_KEY) : null;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type ActionEmail = {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
};

function renderActionEmail({ heading, body, actionLabel, actionUrl }: ActionEmail): string {
  const url = escapeHtml(actionUrl);
  return `<!doctype html>
<html><body style="margin:0;background:#0a0a0a;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#e5e5e5">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border:1px solid #262626;border-radius:16px;padding:32px">
        <tr><td style="font-size:20px;font-weight:800;color:#fff">Sumz <span style="color:#f59e0b">AI</span></td></tr>
        <tr><td style="padding-top:24px;font-size:22px;font-weight:700;color:#fff">${escapeHtml(heading)}</td></tr>
        <tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#a3a3a3">${escapeHtml(body)}</td></tr>
        <tr><td style="padding-top:28px">
          <a href="${url}" style="display:inline-block;background:linear-gradient(90deg,#f59e0b,#ea580c);color:#0a0a0a;font-weight:700;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:999px">${escapeHtml(actionLabel)}</a>
        </td></tr>
        <tr><td style="padding-top:28px;font-size:12px;line-height:1.6;color:#737373">If the button doesn't work, paste this link into your browser:<br><a href="${url}" style="color:#a3a3a3;word-break:break-all">${url}</a></td></tr>
      </table>
      <p style="font-size:12px;color:#525252;margin-top:20px">You received this because someone used this address on Sumz AI. If that wasn't you, ignore this email.</p>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendActionEmail(email: ActionEmail): Promise<void> {
  if (!resend) {
    console.info(`[email] RESEND_API_KEY not set. ${email.subject} for ${email.to}: ${email.actionUrl}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: serverEnv.EMAIL_FROM,
    to: email.to,
    subject: email.subject,
    html: renderActionEmail(email),
    text: `${email.heading}\n\n${email.body}\n\n${email.actionLabel}: ${email.actionUrl}`,
  });
  if (error) throw new Error(`Email failed: ${error.message}`);
}
