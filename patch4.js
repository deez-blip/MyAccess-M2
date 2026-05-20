import fs from "fs";
let c = fs.readFileSync("frontend/src/app/(auth)/signup/page.tsx", "utf8");
c = c.replace(/type HandicapType =\n([^;]+);/g, "");
fs.writeFileSync("frontend/src/app/(auth)/signup/page.tsx", c);
