import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "JaksTrack <noreply@jakstrack.com>";

function emailWrapper(title, body) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a14; padding: 40px 20px;">
      <div style="max-width: 520px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; color: #f0f0f5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">
            Jaks<span style="color: #22d3ee;">Track</span>
          </h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">by Jaksdev Studios</p>
        </div>
        <h2 style="color: #22d3ee; font-size: 18px; margin-bottom: 16px;">${title}</h2>
        ${body}
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          This is an automated notification from JaksTrack.
        </p>
      </div>
    </div>
  `;
}

export async function sendBugAssignedEmail({ to, bugTitle, bugId, projectName, assignedBy }) {
  if (!resend) {
    console.log(`[Email] Bug assigned: ${bugId} "${bugTitle}" → ${to} (Resend not configured)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[${bugId}] Bug Assigned: ${bugTitle}`,
      html: emailWrapper("Bug Assigned to You", `
        <p style="color: #cbd5e1;">A bug has been assigned to you:</p>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 12px 0;">
          <p style="margin: 0 0 8px; color: #22d3ee; font-weight: 600;">${bugId} • ${projectName}</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #f0f0f5;">${bugTitle}</p>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Assigned by: ${assignedBy}</p>
      `),
    });
  } catch (error) {
    console.error("[Email] Failed to send bug assigned email:", error);
  }
}

export async function sendStatusChangedEmail({ to, title, itemId, newStatus, changedBy }) {
  if (!resend) {
    console.log(`[Email] Status changed: ${itemId} → ${newStatus} (Resend not configured)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[${itemId}] Status Updated: ${newStatus}`,
      html: emailWrapper("Status Updated", `
        <p style="color: #cbd5e1;">The status has been updated:</p>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 12px 0;">
          <p style="margin: 0 0 8px; color: #22d3ee; font-weight: 600;">${itemId}</p>
          <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #f0f0f5;">${title}</p>
          <p style="margin: 0;">
            <span style="background: rgba(34,211,238,0.15); color: #22d3ee; padding: 4px 12px; border-radius: 999px; font-size: 13px;">${newStatus}</span>
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Changed by: ${changedBy}</p>
      `),
    });
  } catch (error) {
    console.error("[Email] Failed to send status changed email:", error);
  }
}

export async function sendNewCommentEmail({ to, title, itemId, commentBy, commentPreview }) {
  if (!resend) {
    console.log(`[Email] New comment on ${itemId} by ${commentBy} (Resend not configured)`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[${itemId}] New Comment on: ${title}`,
      html: emailWrapper("New Comment", `
        <p style="color: #cbd5e1;">A new comment was added:</p>
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin: 12px 0;">
          <p style="margin: 0 0 8px; color: #22d3ee; font-weight: 600;">${itemId} — ${title}</p>
          <p style="margin: 0; color: #e2e8f0; font-style: italic;">"${commentPreview}"</p>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Comment by: ${commentBy}</p>
      `),
    });
  } catch (error) {
    console.error("[Email] Failed to send new comment email:", error);
  }
}
