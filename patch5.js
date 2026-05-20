import fs from "fs";

function updateFile(file, regex, replacement) {
  let c = fs.readFileSync(file, "utf8");
  c = c.replace(regex, replacement);
  fs.writeFileSync(file, c);
}

// update RatingForm.tsx to use the new types
let rf = fs.readFileSync(
  "frontend/src/app/center/[...id]/_components/RatingForm.tsx",
  "utf8",
);
rf = rf.replace(
  /const HANDICAP_TYPES: \{ value: HandicapType; label: string \}\[\] = \[[\s\S]*?\];/,
  `const HANDICAP_TYPES: { value: HandicapType; label: string }[] = [
  { value: 'wheelchair', label: 'Fauteuil roulant' },
  { value: 'walking_difficulty', label: 'Marche difficile' },
  { value: 'vision', label: 'Déficience visuelle' },
  { value: 'hearing', label: 'Déficience auditive' },
  { value: 'intellectual', label: 'Déficience intellectuelle' },
  { value: 'psychological', label: 'Handicap psychique' },
  { value: 'autism', label: 'TSA' },
  { value: 'obesity', label: 'Obésité' },
];`,
);
fs.writeFileSync(
  "frontend/src/app/center/[...id]/_components/RatingForm.tsx",
  rf,
);

// update signup page
let sp = fs.readFileSync("frontend/src/app/(auth)/signup/page.tsx", "utf8");
sp = sp.replace(/type HandicapType[\s\S]*?'cognitif';/, ""); // Remove the local HandicapType alias if it's there
fs.writeFileSync("frontend/src/app/(auth)/signup/page.tsx", sp);

// update dashboard page.client.tsx
let dp = fs.readFileSync("frontend/src/app/dashboard/page.client.tsx", "utf8");
dp = dp.replace(
  /'sensoriel',\s*'moteur',\s*'mental',\s*'psychique',\s*'cognitif'/g,
  "'wheelchair', 'walking_difficulty', 'vision', 'hearing', 'intellectual', 'psychological', 'autism', 'obesity'",
);
fs.writeFileSync("frontend/src/app/dashboard/page.client.tsx", dp);
