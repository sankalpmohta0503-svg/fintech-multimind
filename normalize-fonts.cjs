const fs = require("fs");
const path = require("path");

const dirs = [
  "c:/dev/FinTechSIH/frontend/src/pages",
  "c:/dev/FinTechSIH/frontend/src/components",
  "c:/dev/FinTechSIH/frontend/src/layouts",
];

// Eight Core Dimensions type scale mapping.
// Rules applied in order - most specific first.
// PRESERVE: text-4xl (scores), text-lg sm:text-xl (L1 already), text-sm sm:text-base (L2/L3 already), text-xs sm:text-sm (L4 already)
const rules = [
  // PAGE headings: text-3xl -> text-xl sm:text-2xl
  [/\btext-3xl\b/g, "text-xl sm:text-2xl"],

  // Already-normalized combos — stabilize them before touching text-2xl
  // text-xl sm:text-2xl => keep (already done above)
  // text-lg sm:text-xl  => already L1 standard, skip

  // CARD headings: text-2xl -> text-lg sm:text-xl  (L1)
  // But "sm:text-2xl" produced from above rule should also become "sm:text-xl"
  [/\bsm:text-2xl\b/g, "sm:text-xl"],
  [/\btext-2xl\b/g, "text-lg sm:text-xl"],

  // text-xl that is NOT preceded by a breakpoint prefix -> text-sm sm:text-base
  // sm:text-xl is L1 suffix – keep. standalone text-xl -> body heading
  [/(?<![a-z]:)(?<!\S)text-xl\b(?!\s+sm:)/g, "text-sm sm:text-base"],

  // text-lg that is NOT already followed by sm:text- -> text-sm sm:text-base  (L2/L3)
  [/\btext-lg\b(?!\s+sm:text-)/g, "text-sm sm:text-base"],

  // sm:text-lg -> sm:text-base  (scale down within responsive pairs)
  [/\bsm:text-lg\b/g, "sm:text-base"],

  // standalone text-base not already part of sm:text-base pair -> text-xs sm:text-sm  (L4)
  [/\btext-base\b(?!\s+sm:)(?<! sm:)/g, "text-xs sm:text-sm"],

  // sm:text-base that is standalone (not preceded by text-sm or text-xs) -> sm:text-sm
  // We only fix orphaned sm:text-base
  // Actually leave sm:text-base - it may be the L3 target in "text-sm sm:text-base"

  // standalone text-sm not already paired -> text-xs sm:text-sm  (L4)
  [/\btext-sm\b(?!\s+sm:)(?<! sm:)/g, "text-xs sm:text-sm"],
];

let files = [];
dirs.forEach(dir => {
  fs.readdirSync(dir).filter(f => f.endsWith(".jsx") || f.endsWith(".tsx"))
    .forEach(f => files.push(path.join(dir, f)));
});

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  rules.forEach(([from, to]) => {
    content = content.replace(from, to);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("UPDATED:", path.basename(file));
  } else {
    console.log("unchanged:", path.basename(file));
  }
});
console.log("Done.");
