import sql from "../config/db.js";
import { recomputeHealthcarePlaceReviewSignals } from "../services/healthcarePlaces.js";

function parseArgs(argv) {
  const args = {
    placeId: null,
    all: false,
    dryRun: false,
  };

  for (const arg of argv) {
    if (arg === "--all") {
      args.all = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (!args.placeId) {
      args.placeId = arg.replace(/^healthcare:/, "");
    }
  }

  return args;
}

async function getTargetPlaceIds(args) {
  if (args.placeId) return [args.placeId];

  if (args.all) {
    const rows = await sql`
      SELECT id
      FROM healthcare_places
      ORDER BY id
    `;
    return rows.map((row) => row.id);
  }

  const rows = await sql`
    SELECT DISTINCT place_id AS id
    FROM healthcare_place_reviews
    ORDER BY place_id
  `;
  return rows.map((row) => row.id);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();
  const placeIds = await getTargetPlaceIds(args);

  if (args.dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          targetPlaces: placeIds.length,
          mode: args.placeId ? "single" : args.all ? "all" : "reviewed",
        },
        null,
        2
      )
    );
    await sql.end();
    return;
  }

  let updated = 0;
  for (const placeId of placeIds) {
    const result = await recomputeHealthcarePlaceReviewSignals(placeId);
    if (result) updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        updated,
        targetPlaces: placeIds.length,
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
