#!/usr/bin/env node
/**
 * Patches Superset's MainPreset to register
 * the SimpleCalendarFilterPlugin as a native-filter type.
 *
 * Usage:
 *   node scripts/register-plugin.js [/path/to/superset-frontend]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FRONTEND = process.argv[2] || "/app/superset-frontend";

/* 1. Locate the MainPreset file  */
function findPresetFile() {
  const candidates = [
    "src/visualizations/presets/MainPreset.js",
    "src/visualizations/presets/MainPreset.ts",
    "src/visualizations/presets/MainPreset.tsx",
    "src/setup/setupPlugins.ts",
    "src/setup/setupPlugins.js",
  ];
  for (const c of candidates) {
    const full = path.join(FRONTEND, c);
    if (fs.existsSync(full)) return full;
  }
  try {
    const found = execSync(
      `find ${FRONTEND}/src -maxdepth 5 -name "MainPreset*" -type f`,
      { encoding: "utf-8" },
    ).trim();
    if (found) return found.split("\n")[0];
  } catch (_) {}
  return null;
}

const presetFile = findPresetFile();
if (!presetFile) {
  console.error(
    "ERROR: Could not locate MainPreset — manual registration required.",
  );
  process.exit(1);
}
console.log(`Found preset: ${presetFile}`);

let lines = fs.readFileSync(presetFile, "utf-8").split("\n");

// Already patched?
if (lines.some((l) => l.includes("SimpleCalendarFilterPlugin"))) {
  console.log("Plugin already registered — skipping.");
  process.exit(0);
}

/* 2. Add import */
const importLine =
  "import { SimpleCalendarFilterPlugin } from 'superset-plugin-filter-calendar';";

let lastImportIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\s*import\s/.test(lines[i])) {
    let j = i;
    while (
      j < lines.length - 1 &&
      !lines[j].includes(";") &&
      !/^\s*import\s/.test(lines[j + 1])
    )
      j++;
    lastImportIdx = j;
  }
}
if (lastImportIdx >= 0) {
  lines.splice(lastImportIdx + 1, 0, importLine);
} else {
  lines.unshift(importLine);
}

/* 3. Add plugin registration */
const registration =
  "    new SimpleCalendarFilterPlugin().configure({ key: 'filter_calendar' }),";

const patterns = [
  /\.configure\(\s*\{\s*key:\s*['"]filter_time['"]/,
  /\.configure\(\s*\{\s*key:\s*['"]filter_select['"]/,
  /FilterTimePlugin/,
  /FilterSelectPlugin/,
];

let inserted = false;
for (const pat of patterns) {
  for (let i = 0; i < lines.length; i++) {
    if (pat.test(lines[i])) {
      lines.splice(i + 1, 0, registration);
      inserted = true;
      break;
    }
  }
  if (inserted) break;
}

if (!inserted) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/plugins\s*[=:]\s*\[/.test(lines[i])) {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes("]")) {
          lines.splice(j, 0, registration);
          inserted = true;
          break;
        }
      }
      break;
    }
  }
}

fs.writeFileSync(presetFile, lines.join("\n"));
console.log(
  inserted
    ? "Import + registration added successfully."
    : "Import added; registration point not found — register manually.",
);
process.exit(inserted ? 0 : 1);
