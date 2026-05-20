const fs = require("fs");

const path = "frontend/src/app/(auth)/signup/page.tsx";
let content = fs.readFileSync(path, "utf8");

const regexType =
  /type HandicapType\s*=\s*\|\s*"moteur"[\s\S]*?\|\s*"cognitif";/;
content = content.replace(regexType, "");

const regexArray =
  /const handicapTypes: \{ value: HandicapType; label: string \}\[\] = \[[\s\S]*?\];/;
const newArray = `import { HandicapType } from "@/types";

const handicapTypes: { value: HandicapType; label: string }[] = [
  { value: 'wheelchair', label: 'Fauteuil roulant' },
  { value: 'walking_difficulty', label: 'Marche difficile' },
  { value: 'vision', label: 'Déficience visuelle' },
  { value: 'hearing', label: 'Déficience auditive' },
  { value: 'intellectual', label: 'Déficience intellectuelle' },
  { value: 'psychological', label: 'Handicap psychique' },
  { value: 'autism', label: 'TSA' },
  { value: 'obesity', label: 'Obésité' },
];`;

content = content.replace(regexArray, newArray);

fs.writeFileSync(path, content);
console.log("Signup page updated");
