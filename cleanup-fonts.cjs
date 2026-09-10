const fs = require("fs");
const path = require("path");

const dirs = [
  "c:/dev/FinTechSIH/frontend/src/pages",
  "c:/dev/FinTechSIH/frontend/src/components",
  "c:/dev/FinTechSIH/frontend/src/layouts",
];

const fixes = [
  // Double sm: from chained replacements: "sm:text-xs sm:text-sm" -> "sm:text-sm"
  [/\bsm:text-xs\s+sm:text-sm\b/g, "sm:text-sm"],
  [/\bsm:text-xs\s+sm:text-xs\b/g, "sm:text-xs"],
  [/\btext-xs\s+sm:text-xs\s+sm:text-sm\b/g, "text-xs sm:text-sm"],
  [/\btext-xs\s+sm:text-xs\b/g, "text-xs sm:text-sm"],

  // "text-sm sm:text-xs sm:text-sm" -> "text-xs sm:text-sm"
  [/\btext-sm\s+sm:text-xs\s+sm:text-sm\b/g, "text-xs sm:text-sm"],

  // "text-sm sm:text-xs sm:text-xs sm:text-sm" -> "text-xs sm:text-sm"
  [/\btext-sm\s+(?:sm:text-xs\s+)+sm:text-sm\b/g, "text-xs sm:text-sm"],

  // "text-xs sm:text-xs sm:text-sm" -> "text-xs sm:text-sm"
  [/\btext-xs\s+sm:text-xs\s+sm:text-sm\b/g, "text-xs sm:text-sm"],

  // "text-xl sm:text-xl" (duplicate) -> "text-xl sm:text-2xl" (page title)
  [/\btext-xl\s+sm:text-xl\b/g, "text-xl sm:text-2xl"],

  // "sm:text-xl sm:text-xl" -> "sm:text-xl"
  [/\bsm:text-xl\s+sm:text-xl\b/g, "sm:text-xl"],

  // "text-xs sm:text-xs sm:text-xs sm:text-sm" chains
  [/\btext-xs(?:\s+sm:text-xs)+\s+sm:text-sm\b/g, "text-xs sm:text-sm"],

  // "text-sm sm:text-xs" (leftover) -> "text-xs sm:text-sm"
  [/\btext-sm\s+sm:text-xs\b(?!\s+sm:text-sm)/g, "text-xs sm:text-sm"],

  // Leftover: font-bold text-[...] text-xs sm:text-xs sm:text-sm -> condense
  [/\btext-xs\s+sm:text-xs\s+sm:text-sm\b/g, "text-xs sm:text-sm"],
];

let files = [];
dirs.forEach(dir => {
  fs.readdirSync(dir).filter(f => f.endsWith(".jsx") || f.endsWith(".tsx"))
    .forEach(f => files.push(path.join(dir, f)));
});

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Apply fixes multiple passes until stable
  let prev;
  do {
    prev = content;
    fixes.forEach(([from, to]) => {
      content = content.replace(from, to);
    });
  } while (content !== prev);

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("FIXED:", path.basename(file));
  } else {
    console.log("clean:", path.basename(file));
  }
});
console.log("Cleanup done.");
