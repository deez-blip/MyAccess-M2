const fs = require("fs");

const path = "frontend/src/app/dashboard/_components/FilterPanel.tsx";
let content = fs.readFileSync(path, "utf8");

const regex =
  /const handicapTypes: \{ value: HandicapType; label: string; icon: string \}\[\] = \[[\s\S]*?\];/;

const newString = `const handicapTypes: { value: HandicapType; label: string; icon: string }[] = [
  { value: 'wheelchair', label: 'Fauteuil roulant', icon: '🦽' },
  { value: 'walking_difficulty', label: 'Marche difficile', icon: '🦯' },
  { value: 'vision', label: 'Déficience visuelle', icon: '👁️' },
  { value: 'hearing', label: 'Déficience auditive', icon: '🦻' },
  { value: 'intellectual', label: 'Déficience intellectuelle', icon: '🧠' },
  { value: 'psychological', label: 'Handicap psychique', icon: '💭' },
  { value: 'autism', label: 'TSA', icon: '🧩' },
  { value: 'obesity', label: 'Obésité', icon: '⚖️' },
];`;

content = content.replace(regex, newString);

fs.writeFileSync(path, content);
console.log("FilterPanel.tsx updated");
