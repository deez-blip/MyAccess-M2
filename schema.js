import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });
import sql from "./backend/config/db.js";

async function main() {
  const columns =
    await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'healthcare_places'`;
  console.log(columns);
  process.exit(0);
}

main().catch(console.error);
