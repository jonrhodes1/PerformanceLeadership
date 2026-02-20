/*
README
1) Place Leadership_Archetypes_Master_V1.xlsx in the project root.
2) Run: node tools/convert_archetypes_xlsx_to_json.js
3) Outputs:
  - assets/data/archetypes.json
  - assets/data/archetypes_full.json
  - assets/data/archetype_goal_risk_pace.json
*/

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SOURCE_FILE = path.join(__dirname, '..', 'Leadership_Archetypes_Master_V1.xlsx');
const PREFS_FILE = path.join(__dirname, '..', 'Archetype_Goal_Risk_Pace_Preferences_WORLD_CLASS.xlsx');
const OUT_SUMMARY = path.join(__dirname, '..', 'assets', 'data', 'archetypes.json');
const OUT_FULL = path.join(__dirname, '..', 'assets', 'data', 'archetypes_full.json');
const OUT_PREFS = path.join(__dirname, '..', 'assets', 'data', 'archetype_goal_risk_pace.json');

const workbook = XLSX.readFile(SOURCE_FILE);
const sheet = workbook.Sheets['Archetypes'];
if (!sheet) {
  console.error('Sheet "Archetypes" not found.');
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

const items = rows.map((row) => ({
  archetype: row['Archetype'],
  descriptor: row['Descriptor'],
  preference: row['Preference (single-question option)'],
  bestSelf: row['Best-self behaviours'],
  drift: row['Under-pressure drift'],
  triggers: row['Common triggers'],
  communication: row['Communication preferences'],
  growthEdge: row['Growth edge (micro-shift)'],
  synergyPartner: row['Synergy partner'],
  synergyMeaning: row['Synergy meaning'],
})).filter((row) => row.archetype);

const ordered = items.map((row) => row.archetype);

const summary = {
  ordered,
  items: items.map((row) => ({
    name: row.archetype,
    preference: row.preference,
  })),
};

const full = {
  items: items.map((row) => ({
    archetype: row.archetype,
    descriptor: row.descriptor,
    bestSelf: row.bestSelf,
    drift: row.drift,
    triggers: row.triggers,
    communication: row.communication,
    growthEdge: row.growthEdge,
    synergyPartner: row.synergyPartner,
    synergyMeaning: row.synergyMeaning,
  })),
};

fs.writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));
fs.writeFileSync(OUT_FULL, JSON.stringify(full, null, 2));

const prefsWorkbook = XLSX.readFile(PREFS_FILE);
const prefsSheet = prefsWorkbook.Sheets['Archetype Preferences'] || prefsWorkbook.Sheets[prefsWorkbook.SheetNames[0]];
if (!prefsSheet) {
  console.error('Sheet "Archetype Preferences" not found.');
  process.exit(1);
}

const prefRows = XLSX.utils.sheet_to_json(prefsSheet, { defval: '' });
const prefs = {
  items: prefRows.map((row) => ({
    archetype: row['Archetype'],
    exploreExploit: Number(row['Explore ↔ Exploit (9=Explore, 1=Exploit)']),
    pacePrecision: Number(row['Pace ↔ Precision (9=Pace, 1=Precision)']),
    riskTolerance: Number(row['Risk Tolerance (9=High, 1=Low)']),
    goalPreference: row['How this archetype prefers goals to work'],
    goalComms: row['Preferred goal communication style (what to say)'],
    feedbackStyle: row['Preferred feedback style (how to coach)'],
    watchouts: row['Under-pressure watch-outs (what to protect against)'],
  })).filter((row) => row.archetype),
};

fs.writeFileSync(OUT_PREFS, JSON.stringify(prefs, null, 2));

console.log('Archetype JSON files created.');
