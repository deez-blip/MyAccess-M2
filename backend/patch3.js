import fs from "fs";
let c = fs.readFileSync("routes/centers.js", "utf8");
c = c.replace(
  /function handicapScoreCondition[\s\S]*?return sql\`FALSE\`;\n}/,
  `function handicapScoreCondition(handicapType, handicapMinScore) {
  if (handicapType === "wheelchair") return sql\`COALESCE(CAST(si.profile_counts->>'wheelchair' AS INTEGER), 0) > 0\`;
  if (handicapType === "walking_difficulty") return sql\`COALESCE(CAST(si.profile_counts->>'walking_difficulty' AS INTEGER), 0) > 0\`;
  if (handicapType === "vision") return sql\`(COALESCE(CAST(si.profile_counts->>'low_vision' AS INTEGER), 0) > 0 OR COALESCE(CAST(si.profile_counts->>'blind' AS INTEGER), 0) > 0)\`;
  if (handicapType === "hearing") return sql\`COALESCE(CAST(si.profile_counts->>'hearing' AS INTEGER), 0) > 0\`;
  if (handicapType === "intellectual") return sql\`COALESCE(CAST(si.profile_counts->>'intellectual' AS INTEGER), 0) > 0\`;
  if (handicapType === "psychological") return sql\`COALESCE(CAST(si.profile_counts->>'psychological' AS INTEGER), 0) > 0\`;
  if (handicapType === "autism") return sql\`COALESCE(CAST(si.profile_counts->>'autism' AS INTEGER), 0) > 0\`;
  if (handicapType === "obesity") return sql\`COALESCE(CAST(si.profile_counts->>'obesity' AS INTEGER), 0) > 0\`;
  
  return sql\`FALSE\`;
}`,
);
fs.writeFileSync("routes/centers.js", c);
