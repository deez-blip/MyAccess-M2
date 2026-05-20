import sql from "../config/db.js";

const MAX_PAGE_PATH_LENGTH = 500;
const MAX_USER_AGENT_LENGTH = 1000;

function truncate(value, maxLength) {
  if (value === undefined || value === null) return null;
  return String(value).slice(0, maxLength);
}

function getIpAddress(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function getVisitorId(req) {
  const visitorId = req?.headers?.["x-visitor-id"];

  if (typeof visitorId !== "string" || !visitorId.trim()) {
    return null;
  }

  return visitorId.trim().slice(0, 120);
}

export async function logAuditEvent({
  req,
  userId = null,
  eventType,
  pagePath = null,
  metadata = {},
}) {
  try {
    const visitorId = getVisitorId(req);
    const auditMetadata = {
      ...(metadata || {}),
      ...(visitorId ? { visitorId } : {}),
    };

    await sql`
      INSERT INTO audit_logs (
        user_id,
        event_type,
        page_path,
        metadata,
        ip_address,
        user_agent
      )
      VALUES (
        ${userId},
        ${eventType},
        ${truncate(pagePath, MAX_PAGE_PATH_LENGTH)},
        ${sql.json(auditMetadata)},
        ${req ? getIpAddress(req) : null},
        ${req ? truncate(req.headers["user-agent"], MAX_USER_AGENT_LENGTH) : null}
      )
    `;
  } catch (error) {
    console.error("Erreur écriture audit log:", {
      eventType,
      userId,
      message: error.message,
    });
  }
}
