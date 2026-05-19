import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const defaultCsvPath = path.join(repoRoot, "docs/csv/Etablissement_medicaux.csv");
const migrationPath = path.join(
  repoRoot,
  "backend/migrations/06_healthcare_establishments.sql"
);

const coreColumns = new Set([
  "id",
  "name",
  "postal_code",
  "commune",
  "numero",
  "voie",
  "lieu_dit",
  "code_insee",
  "siret",
  "activite",
  "contact_url",
  "site_internet",
  "longitude",
  "latitude",
  "labels",
  "labels_familles_handicap",
  "registre_url",
  "conformite",
  "rnb_id",
]);

let sqlClient;

async function getSql() {
  if (!sqlClient) {
    sqlClient = (await import("../config/db.js")).default;
  }
  return sqlClient;
}

export function parseArgs(argv) {
  const args = {
    csv: defaultCsvPath,
    applySchema: false,
    dryRun: false,
    limit: null,
    batchSize: 500,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--csv" && next) {
      args.csv = path.resolve(process.cwd(), next);
      index += 1;
    } else if (arg === "--apply-schema") {
      args.applySchema = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--limit" && next) {
      args.limit = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === "--batch-size" && next) {
      args.batchSize = Number.parseInt(next, 10);
      index += 1;
    }
  }

  return args;
}

export function parseCsv(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export function loadRows(csvPath, limit = null) {
  const text = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const [header, ...rows] = parseCsv(text);
  const selectedRows = limit ? rows.slice(0, limit) : rows;

  return selectedRows.map((row) =>
    Object.fromEntries(header.map((column, index) => [column, row[index] || ""]))
  );
}

export function normalize(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function normalizeAddress(value) {
  return normalize(value)
    .replace(/\bAVENUE\b/g, "AV")
    .replace(/\bBOULEVARD\b/g, "BD")
    .replace(/\bCHEMIN\b/g, "CHE")
    .replace(/\bPLACE\b/g, "PL")
    .replace(/\bROUTE\b/g, "RTE")
    .replace(/\bRUE\b/g, "R")
    .replace(/\bDOCTEUR\b/g, "DR")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCity(value) {
  return normalize(value).replace(/\bCEDEX\b/g, "").replace(/\s+/g, " ").trim();
}

export function rowAddress(row) {
  return [row.numero, row.voie, row.lieu_dit]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function locationKeyFromParts(address, postalCode, city) {
  return [
    normalizeAddress(address),
    normalize(postalCode),
    normalizeCity(city),
  ].join("|");
}

export function locationKey(row) {
  return locationKeyFromParts(rowAddress(row), row.postal_code, row.commune);
}

function stableHash(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

export function stableLocationId(firstRow, key) {
  const sourceId = String(firstRow.id || "").trim();
  return sourceId ? `accesslibre_${sourceId}` : `accesslibre_${stableHash(key)}`;
}

function parseNullableString(value) {
  const trimmed = String(value || "").trim();
  return trimmed || null;
}

function parseNumber(value) {
  const parsed = Number.parseFloat(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (normalizedValue === "true") return true;
  if (normalizedValue === "false") return false;
  return null;
}

function parseArray(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Fall back to textual separators used by some CSV exports.
  }

  return trimmed
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAccessibilityValue(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const booleanValue = parseBoolean(trimmed);
  if (booleanValue !== null) return booleanValue;

  const numberValue = parseNumber(trimmed);
  if (numberValue !== null && /^-?\d+(?:[.,]\d+)?$/.test(trimmed)) {
    return numberValue;
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function accessibilityData(row) {
  return Object.fromEntries(
    Object.entries(row)
      .filter(([column, value]) => !coreColumns.has(column) && String(value || "").trim())
      .map(([column, value]) => [column, parseAccessibilityValue(value)])
  );
}

function activityKindGuess(activity) {
  const normalizedActivity = normalize(activity);

  if (
    normalizedActivity.includes("HOPITAL") ||
    normalizedActivity.includes("ETABLISSEMENT DE SANTE") ||
    normalizedActivity.includes("MAISON DE SANTE") ||
    normalizedActivity.includes("CENTRE DE SANTE")
  ) {
    return "probable_health_center_or_shared_site";
  }

  if (
    normalizedActivity.includes("LABORATOIRE") ||
    normalizedActivity.includes("RADIODIAGNOSTIC") ||
    normalizedActivity.includes("IMAGERIE")
  ) {
    return "probable_specialist_group";
  }

  if (normalizedActivity.includes("CENTRE MEDICAL")) {
    return "probable_group_practice";
  }

  return "individual_or_small_practice";
}

function mostSpecificKind(kinds) {
  const priority = [
    "probable_health_center_or_shared_site",
    "probable_specialist_group",
    "probable_group_practice",
    "individual_or_small_practice",
  ];

  return priority.find((kind) => kinds.includes(kind)) || "individual_or_small_practice";
}

function professionCounts(rows) {
  const counts = new Map();
  for (const row of rows) {
    const activity = row.activite || "Etablissement de santé";
    counts.set(activity, (counts.get(activity) || 0) + 1);
  }
  return Object.fromEntries(counts);
}

function validLocationRow(row) {
  return Boolean(rowAddress(row) && row.postal_code && row.commune);
}

export function buildImportDataset(rows, existingLocations) {
  const existingByKey = new Map();
  for (const location of existingLocations) {
    const key = locationKeyFromParts(location.address, location.postal_code, location.city);
    if (!existingByKey.has(key)) existingByKey.set(key, location);
  }

  const groupsByKey = new Map();
  const skippedRows = [];

  for (const row of rows) {
    if (!row.id || !validLocationRow(row)) {
      skippedRows.push(row);
      continue;
    }

    const key = locationKey(row);
    if (!groupsByKey.has(key)) groupsByKey.set(key, []);
    groupsByKey.get(key).push(row);
  }

  const locationIdByKey = new Map();
  const newLocations = [];
  let matchedExistingLocations = 0;

  for (const [key, groupRows] of groupsByKey.entries()) {
    const firstRow = groupRows[0];
    const existingLocation = existingByKey.get(key);

    if (existingLocation) {
      locationIdByKey.set(key, existingLocation.id);
      matchedExistingLocations += 1;
      continue;
    }

    const activities = [...new Set(groupRows.map((row) => row.activite).filter(Boolean))];
    const kinds = activities.map(activityKindGuess);
    const location = {
      id: stableLocationId(firstRow, key),
      address: rowAddress(firstRow),
      postal_code: firstRow.postal_code,
      city: firstRow.commune,
      region: null,
      latitude: parseNumber(firstRow.latitude),
      longitude: parseNumber(firstRow.longitude),
      geocoding_score: 1,
      practitioner_count: 0,
      profession_count: Math.max(1, activities.length),
      kind_guess: mostSpecificKind(kinds),
      professions: professionCounts(groupRows),
      source: "accesslibre_etablissements",
    };

    locationIdByKey.set(key, location.id);
    newLocations.push(location);
  }

  const establishments = rows
    .filter((row) => row.id && validLocationRow(row))
    .map((row) => ({
      accesslibre_id: row.id,
      location_id: locationIdByKey.get(locationKey(row)),
      name: row.name,
      activity: row.activite || null,
      siret: parseNullableString(row.siret),
      rnb_id: parseNullableString(row.rnb_id),
      code_insee: parseNullableString(row.code_insee),
      contact_url: parseNullableString(row.contact_url),
      site_internet: parseNullableString(row.site_internet),
      labels: parseArray(row.labels),
      labels_familles_handicap: parseArray(row.labels_familles_handicap),
      conformite: parseBoolean(row.conformite),
      accessibility_data: accessibilityData(row),
    }));

  const digitalAccessByLocationId = new Map();
  for (const establishment of establishments) {
    const websiteUrl = establishment.site_internet || establishment.contact_url;
    if (!websiteUrl) continue;

    const existing = digitalAccessByLocationId.get(establishment.location_id) || {
      location_id: establishment.location_id,
      has_website: true,
      website_url: websiteUrl,
      booking_methods: ["website"],
      source: "accesslibre_etablissements",
      checked_at: new Date(),
    };

    if (!existing.website_url && websiteUrl) existing.website_url = websiteUrl;
    digitalAccessByLocationId.set(establishment.location_id, existing);
  }

  return {
    skippedRows,
    matchedExistingLocations,
    groupedLocationCount: groupsByKey.size,
    newLocations,
    establishments,
    digitalAccessRows: [...digitalAccessByLocationId.values()],
  };
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function applySchema() {
  const sql = await getSql();
  await sql.unsafe(fs.readFileSync(migrationPath, "utf8"));
}

async function loadExistingLocations() {
  const sql = await getSql();
  return sql`
    SELECT id, address, postal_code, city
    FROM healthcare_locations
  `;
}

async function insertLocations(locations, batchSize) {
  const sql = await getSql();
  let upserted = 0;
  for (const batch of chunk(locations, batchSize)) {
    await sql`
      INSERT INTO healthcare_locations ${sql(
        batch,
        "id",
        "address",
        "postal_code",
        "city",
        "region",
        "latitude",
        "longitude",
        "geocoding_score",
        "practitioner_count",
        "profession_count",
        "kind_guess",
        "professions",
        "source"
      )}
      ON CONFLICT ("id") DO UPDATE SET
        "address" = EXCLUDED."address",
        "postal_code" = EXCLUDED."postal_code",
        "city" = EXCLUDED."city",
        "region" = EXCLUDED."region",
        "latitude" = COALESCE(healthcare_locations."latitude", EXCLUDED."latitude"),
        "longitude" = COALESCE(healthcare_locations."longitude", EXCLUDED."longitude"),
        "geocoding_score" = COALESCE(healthcare_locations."geocoding_score", EXCLUDED."geocoding_score"),
        "profession_count" = GREATEST(healthcare_locations."profession_count", EXCLUDED."profession_count"),
        "kind_guess" = COALESCE(healthcare_locations."kind_guess", EXCLUDED."kind_guess"),
        "professions" = healthcare_locations."professions" || EXCLUDED."professions",
        "source" = COALESCE(healthcare_locations."source", EXCLUDED."source"),
        "updated_at" = NOW()
    `;
    upserted += batch.length;
  }
  return upserted;
}

async function insertEstablishments(establishments, batchSize) {
  const sql = await getSql();
  let upserted = 0;
  for (const batch of chunk(establishments, batchSize)) {
    await sql`
      INSERT INTO healthcare_establishments ${sql(
        batch,
        "accesslibre_id",
        "location_id",
        "name",
        "activity",
        "siret",
        "rnb_id",
        "code_insee",
        "contact_url",
        "site_internet",
        "labels",
        "labels_familles_handicap",
        "conformite",
        "accessibility_data"
      )}
      ON CONFLICT ("accesslibre_id") DO UPDATE SET
        "location_id" = EXCLUDED."location_id",
        "name" = EXCLUDED."name",
        "activity" = EXCLUDED."activity",
        "siret" = EXCLUDED."siret",
        "rnb_id" = EXCLUDED."rnb_id",
        "code_insee" = EXCLUDED."code_insee",
        "contact_url" = EXCLUDED."contact_url",
        "site_internet" = EXCLUDED."site_internet",
        "labels" = EXCLUDED."labels",
        "labels_familles_handicap" = EXCLUDED."labels_familles_handicap",
        "conformite" = EXCLUDED."conformite",
        "accessibility_data" = EXCLUDED."accessibility_data",
        "updated_at" = NOW()
    `;
    upserted += batch.length;
  }
  return upserted;
}

async function upsertDigitalAccess(rows, batchSize) {
  const sql = await getSql();
  let upserted = 0;
  for (const batch of chunk(rows, batchSize)) {
    await sql`
      INSERT INTO healthcare_digital_access ${sql(
        batch,
        "location_id",
        "has_website",
        "website_url",
        "booking_methods",
        "source",
        "checked_at"
      )}
      ON CONFLICT ("location_id") DO UPDATE SET
        "has_website" = healthcare_digital_access."has_website" OR EXCLUDED."has_website",
        "website_url" = COALESCE(healthcare_digital_access."website_url", EXCLUDED."website_url"),
        "booking_methods" = (
          SELECT ARRAY(
            SELECT DISTINCT method
            FROM UNNEST(healthcare_digital_access."booking_methods" || EXCLUDED."booking_methods") AS method
          )
        ),
        "source" = CASE
          WHEN healthcare_digital_access."source" IS NULL THEN EXCLUDED."source"
          WHEN healthcare_digital_access."source" = EXCLUDED."source" THEN healthcare_digital_access."source"
          WHEN healthcare_digital_access."source" LIKE '%' || EXCLUDED."source" || '%' THEN healthcare_digital_access."source"
          ELSE healthcare_digital_access."source" || '+' || EXCLUDED."source"
        END,
        "checked_at" = COALESCE(healthcare_digital_access."checked_at", EXCLUDED."checked_at"),
        "updated_at" = NOW()
    `;
    upserted += batch.length;
  }
  return upserted;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.applySchema && !args.dryRun) {
    await applySchema();
  }

  const rows = loadRows(args.csv, args.limit);
  const existingLocations = await loadExistingLocations();
  const dataset = buildImportDataset(rows, existingLocations);
  const duplicateCsvAddressRows =
    rows.filter((row) => row.id && validLocationRow(row)).length - dataset.groupedLocationCount;
  const summary = {
    csv: path.relative(repoRoot, args.csv),
    rows: rows.length,
    skippedRows: dataset.skippedRows.length,
    groupedLocations: dataset.groupedLocationCount,
    matchedExistingLocationGroups: dataset.matchedExistingLocations,
    newLocations: dataset.newLocations.length,
    duplicateCsvAddressRows,
    establishments: dataset.establishments.length,
    digitalAccessRows: dataset.digitalAccessRows.length,
  };

  if (args.dryRun) {
    console.log(JSON.stringify({ dryRun: true, ...summary }, null, 2));
    const sql = await getSql();
    await sql.end();
    return;
  }

  const imported = {
    locations: await insertLocations(dataset.newLocations, args.batchSize),
    establishments: await insertEstablishments(dataset.establishments, args.batchSize),
    digitalAccess: await upsertDigitalAccess(dataset.digitalAccessRows, args.batchSize),
  };

  console.log(JSON.stringify({ imported, ...summary }, null, 2));
  const sql = await getSql();
  await sql.end();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(async (error) => {
    console.error(error);
    if (sqlClient) await sqlClient.end({ timeout: 5 }).catch(() => {});
    process.exit(1);
  });
}
