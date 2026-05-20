import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import sql from "../config/db.js";
import { logAuditEvent } from "../services/auditLog.js";

const router = express.Router();
const AUDIT_EVENT_TYPES = new Set([
  "signup",
  "login",
  "logout",
  "page_view",
  "profile_update",
  "review_create",
  "review_update",
  "review_delete",
]);

function parseLimit(value) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) return 100;
  return Math.max(1, Math.min(parsedValue, 500));
}

function parseOffset(value) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) return 0;
  return Math.max(0, parsedValue);
}

function buildWhereCondition(conditions) {
  if (conditions.length === 0) {
    return sql``;
  }

  const combinedConditions = conditions
    .slice(1)
    .reduce((combined, condition) => sql`${combined} AND ${condition}`, conditions[0]);

  return sql`WHERE ${combinedConditions}`;
}

function buildAuditLogConditions(query) {
  const conditions = [];
  const eventType = String(query.eventType || "").trim();
  const pagePath = String(query.pagePath || "").trim();
  const userId = String(query.userId || "").trim();
  const visitorId = String(query.visitorId || "").trim();
  const search = String(query.search || "").trim();

  if (eventType && eventType !== "all" && AUDIT_EVENT_TYPES.has(eventType)) {
    conditions.push(sql`event_type = ${eventType}`);
  }

  if (pagePath) {
    conditions.push(sql`page_path ILIKE ${`%${pagePath}%`}`);
  }

  if (userId) {
    conditions.push(sql`user_id::TEXT = ${userId}`);
  }

  if (visitorId) {
    conditions.push(sql`visitor_id = ${visitorId}`);
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(sql`
      (
        event_type ILIKE ${searchPattern}
        OR page_path ILIKE ${searchPattern}
        OR user_email ILIKE ${searchPattern}
        OR user_name ILIKE ${searchPattern}
        OR visitor_id ILIKE ${searchPattern}
        OR user_id::TEXT ILIKE ${searchPattern}
      )
    `);
  }

  return conditions;
}

async function getUserFromOptionalToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

router.post("/page-view", async (req, res) => {
  try {
    const { path, title, referrer } = req.body || {};
    const pagePath = String(path || "").trim();

    if (!pagePath || pagePath.length > 500) {
      return res.status(400).json({ error: "Chemin de page invalide" });
    }

    const user = await getUserFromOptionalToken(req);

    await logAuditEvent({
      req,
      userId: user?.id || null,
      eventType: "page_view",
      pagePath,
      metadata: {
        title: title ? String(title).slice(0, 300) : null,
        referrer: referrer ? String(referrer).slice(0, 1000) : null,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erreur audit page_view:", error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement du log" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const offset = parseOffset(req.query.offset);
    const conditions = buildAuditLogConditions(req.query);
    const whereCondition = buildWhereCondition(conditions);
    const last24hWhereCondition = buildWhereCondition([
      ...conditions,
      sql`created_at >= NOW() - INTERVAL '24 hours'`,
    ]);

    const [logs, totalRows, eventCounts, last24hRows] = await Promise.all([
      sql`
        SELECT
          id,
          created_at,
          event_type,
          page_path,
          user_id,
          user_email,
          user_name,
          visitor_id,
          metadata,
          ip_address,
          user_agent
        FROM audit_log_details
        ${whereCondition}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS total
        FROM audit_log_details
        ${whereCondition}
      `,
      sql`
        SELECT event_type, COUNT(*)::int AS count
        FROM audit_log_details
        ${whereCondition}
        GROUP BY event_type
        ORDER BY count DESC, event_type ASC
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM audit_log_details
        ${last24hWhereCondition}
      `,
    ]);

    res.json({
      logs: logs.map((log) => ({
        id: log.id,
        createdAt: log.created_at?.toISOString?.() || log.created_at,
        eventType: log.event_type,
        pagePath: log.page_path,
        userId: log.user_id,
        userEmail: log.user_email,
        userName: log.user_name,
        visitorId: log.visitor_id,
        metadata: log.metadata || {},
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
      })),
      pagination: {
        total: totalRows[0]?.total || 0,
        limit,
        offset,
      },
      stats: {
        last24h: last24hRows[0]?.count || 0,
        byEventType: eventCounts,
      },
    });
  } catch (error) {
    console.error("Erreur récupération audit logs:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des logs" });
  }
});

export default router;
