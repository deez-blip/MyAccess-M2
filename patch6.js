import fs from "fs";

let c = fs.readFileSync("backend/routes/centers.js", "utf8");

c = c.replace(
  /const allowedHandicapTypes = new Set\(Object\.keys\(HANDICAP_SCORE_PROFILES\)\);/g,
  `const allowedHandicapTypes = new Set([
  "wheelchair",
  "walking_difficulty",
  "vision",
  "hearing",
  "intellectual",
  "psychological",
  "autism",
  "obesity"
]);`,
);

fs.writeFileSync("backend/routes/centers.js", c);
