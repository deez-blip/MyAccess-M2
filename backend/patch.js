import fs from "fs";
let c = fs.readFileSync(
  "../frontend/src/app/dashboard/_components/FilterPanel.tsx",
  "utf8",
);
c = c.replace(
  /const handicapTypes:[^\]]+\];/,
  `const handicapTypes: { value: HandicapType; label: string; icon: string }[] = [
  { value: 'wheelchair', label: 'Fauteuil roulant', icon: '🦽' },
  { value: 'walking_difficulty', label: 'Marche difficile', icon: '🦯' },
  { value: 'vision', label: 'Déficience visuelle', icon: '👁️' },
  { value: 'hearing', label: 'Déficience auditive', icon: '🦻' },
  { value: 'intellectual', label: 'Déficience intellectuelle', icon: '🧠' },
  { value: 'psychological', label: 'Handicap psychique', icon: '💭' },
  { value: 'autism', label: 'TSA', icon: '🧩' },
  { value: 'obesity', label: 'Obésité', icon: '⚖️' },
];`,
);
fs.writeFileSync(
  "../frontend/src/app/dashboard/_components/FilterPanel.tsx",
  c,
);
