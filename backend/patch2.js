import fs from "fs";
let c = fs.readFileSync("../frontend/src/app/(auth)/signup/page.tsx", "utf8");
c = c.replace(
  /const handicapTypes:[^\]]+\];/,
  `const handicapTypes: { value: HandicapType; label: string }[] = [
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
fs.writeFileSync("../frontend/src/app/(auth)/signup/page.tsx", c);
