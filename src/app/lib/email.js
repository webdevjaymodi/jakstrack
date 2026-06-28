import { Resend } from "resend";

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || "JaksTrack <noreply@jakstrack.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Shared email wrapper with branded HTML layout.
 */
function buildEmailHtml({ heading, body }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">🐛 JaksTrack</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">${heading}</h2>
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
                You received this email because of your JaksTrack account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a notification email when a bug is assigned to someone.
 */
export async function sendBugAssignedEmail({ to, bugTitle, bugId, projectName, assignedBy }) {
  if (!resend) {
    console.log(`[Email Skipped] Bug assigned: "${bugTitle}" to ${to} (no RESEND_API_KEY)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[JaksTrack] Bug assigned to you: ${bugTitle}`,
      html: buildEmailHtml({
        heading: "Bug Assigned to You",
        body: `
          <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
            <strong>${assignedBy}</strong> assigned you a bug in <strong>${projectName}</strong>.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px 0;width:100%;">
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;width:80px;">Bug ID</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;font-weight:600;">${bugId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;">Title</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;">${bugTitle}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;">Project</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;">${projectName}</td>
            </tr>
          </table>
          <a href="${APP_URL}/bugs/${bugId}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
            View Bug
          </a>
        `,
      }),
    });
  } catch (error) {
    console.error("[Email Error] sendBugAssignedEmail:", error);
  }
}

/**
 * Send a notification email when a bug or requirement status changes.
 */
export async function sendStatusChangedEmail({ to, title, itemId, newStatus, changedBy }) {
  if (!resend) {
    console.log(`[Email Skipped] Status changed: "${title}" → ${newStatus} (no RESEND_API_KEY)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[JaksTrack] Status updated: ${title}`,
      html: buildEmailHtml({
        heading: "Status Updated",
        body: `
          <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
            <strong>${changedBy}</strong> changed the status of an item you're involved with.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px 0;width:100%;">
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;width:100px;">Item ID</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;font-weight:600;">${itemId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;">Title</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;">${title}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;">New Status</td>
              <td style="padding:8px 0;">
                <span style="display:inline-block;padding:4px 12px;background:#dbeafe;color:#1d4ed8;border-radius:12px;font-size:12px;font-weight:600;">
                  ${newStatus}
                </span>
              </td>
            </tr>
          </table>
          <a href="${APP_URL}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
            View in JaksTrack
          </a>
        `,
      }),
    });
  } catch (error) {
    console.error("[Email Error] sendStatusChangedEmail:", error);
  }
}

/**
 * Send a notification email when a new comment is added.
 */
export async function sendNewCommentEmail({ to, title, itemId, commentBy, commentPreview }) {
  if (!resend) {
    console.log(`[Email Skipped] New comment on "${title}" by ${commentBy} (no RESEND_API_KEY)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[JaksTrack] New comment on: ${title}`,
      html: buildEmailHtml({
        heading: "New Comment",
        body: `
          <p style="margin:0 0 12px;color:#3f3f46;font-size:14px;line-height:1.6;">
            <strong>${commentBy}</strong> commented on an item you're involved with.
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:16px 0;width:100%;">
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;width:80px;">Item ID</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;font-weight:600;">${itemId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;font-size:13px;">Title</td>
              <td style="padding:8px 0;color:#18181b;font-size:14px;">${title}</td>
            </tr>
          </table>
          <div style="margin:16px 0;padding:16px;background:#f4f4f5;border-left:3px solid #6366f1;border-radius:4px;">
            <p style="margin:0;color:#3f3f46;font-size:14px;font-style:italic;line-height:1.5;">
              "${commentPreview}"
            </p>
          </div>
          <a href="${APP_URL}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#6366f1;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
            View in JaksTrack
          </a>
        `,
      }),
    });
  } catch (error) {
    console.error("[Email Error] sendNewCommentEmail:", error);
  }
}
