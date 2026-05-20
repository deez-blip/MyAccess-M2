const fs = require("fs");
const path = "frontend/src/app/dashboard/_components/FilterPanel.tsx";
let content = fs.readFileSync(path, "utf8");

// Fix encoding issues caused by previous replacements
content = content.replace(
  /Filtrer par type de services \/ Ã©quipements/g,
  "Filtrer par type de services / équipements",
);
content = content.replace(
  /AccÃ¨s plain-pied, Rampe, Ascenseur PMR/g,
  "Accès plain-pied, Rampe, Ascenseur PMR",
);
content = content.replace(
  /Soutien LSF, Audio-description, Braille/g,
  "Soutien LSF, Audio-description, Braille",
);
content = content.replace(
  /Accueil adaptÃ©, SignalÃ©tique simplifiÃ©e/g,
  "Accueil adapté, Signalétique simplifiée",
);
content = content.replace(
  /Espace calme, Environnement apaisÃ©/g,
  "Espace calme, Environnement apaisé",
);
content = content.replace(
  /AmÃ©nagements TSA, Guidage spÃ©cifique/g,
  "Aménagements TSA, Guidage spécifique",
);
content = content.replace(/Ã©/g, "é");
content = content.replace(/Ã¨/g, "è");
content = content.replace(/Ã /g, "à");
content = content.replace(/Ã¢/g, "â");
content = content.replace(/Ã§/g, "ç");

fs.writeFileSync(path, content);
console.log("Fixed encoding in FilterPanel.tsx");
