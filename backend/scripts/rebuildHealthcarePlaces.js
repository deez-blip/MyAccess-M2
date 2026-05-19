import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import sql from "../config/db.js";
import { recomputeHealthcarePlaceReviewSignals } from "../services/healthcarePlaces.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");
const migrationPath = path.join(
  repoRoot,
  "backend/migrations/10_create_clean_healthcare_schema.sql"
);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function parseArgs(argv) {
  const args = {
    applySchema: false,
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === "--apply-schema") {
      args.applySchema = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

async function applySchema() {
  await sql.unsafe(fs.readFileSync(migrationPath, "utf8"));
}

async function inspectCounts() {
  const [places] = await sql`
    SELECT COUNT(*)::int AS count
    FROM healthcare_places
  `;
  const [sources] = await sql`
    SELECT COUNT(*)::int AS count
    FROM healthcare_place_sources
  `;
  const [reviews] = await sql`
    SELECT COUNT(*)::int AS count
    FROM healthcare_place_reviews
  `;

  return {
    places: places.count,
    sources: sources.count,
    reviews: reviews.count,
  };
}

async function rebuildSearchVectors() {
  await sql`
    UPDATE healthcare_places
    SET
      search_vector = to_tsvector('simple', search_text),
      updated_at = NOW()
  `;
}

async function recomputeReviewedPlaces() {
  const reviewedPlaces = await sql`
    SELECT DISTINCT place_id
    FROM healthcare_place_reviews
    ORDER BY place_id
  `;

  let updated = 0;
  for (const row of reviewedPlaces) {
    const result = await recomputeHealthcarePlaceReviewSignals(row.place_id);
    if (result) updated += 1;
  }

  return updated;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  if (args.applySchema && !args.dryRun) {
    await applySchema();
  }

  const before = await inspectCounts();

  if (args.dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          before,
          schemaMigration: migrationPath,
        },
        null,
        2
      )
    );
    await sql.end();
    return;
  }

  await rebuildSearchVectors();
  const recomputedPlaces = await recomputeReviewedPlaces();
  const after = await inspectCounts();

  console.log(
    JSON.stringify(
      {
        before,
        after,
        recomputedPlaces,
        durationMs: Date.now() - startedAt,
      },
      null,
      2
    )
  );
  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 5 }).catch(() => {});
  process.exit(1);
});
