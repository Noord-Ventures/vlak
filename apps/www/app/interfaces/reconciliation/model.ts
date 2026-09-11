export const RECONCILIATION_LIMITS = {
  combinedBytes: 10 * 1024 * 1024,
  rows: 50_000,
  columns: 512,
  cellCharacters: 1_000_000,
  nameCharacters: 180,
  noteCharacters: 500,
  decisions: 50_000,
} as const;

export const PARSER_VERSION = 1;
export const RECIPE_VERSION = 1;

export type CsvCell = string | null;
export type CsvHeader = { id: string; sourceName: string; label: string; occurrence: number };
export type CsvRow = { id: string; sourceRow: number; cells: CsvCell[] };
export type CsvTable = { parserVersion: 1; headers: CsvHeader[]; rows: CsvRow[]; diagnostics: string[] };
export type ReconciliationSource = { name: string; size: number; hash: string; text: string; table: CsvTable };
export type ColumnPair = { leftId: string; rightId: string; label: string };
export type Recipe = { version: 1; match: "exact"; leftKeyId: string; rightKeyId: string; compare: ColumnPair[] };
export type Category = "matched" | "missing" | "conflicting" | "ambiguous";
export type ResultGroup = {
  id: string;
  category: Category;
  key: string | null;
  left: CsvRow[];
  right: CsvRow[];
  differences: string[];
};
export type Comparison = {
  fingerprint: string;
  groups: ResultGroup[];
  totals: Record<Category, number> & { leftRows: number; rightRows: number; outputRows: number };
};
export type ReviewDecision = { groupId: string; fingerprint: string; status: "reviewed" | "follow-up"; note: string };
export type ReconciliationProject = {
  schema: "vlak.reconciliation";
  version: 1;
  title: string;
  sources: { left: ReconciliationSource | null; right: ReconciliationSource | null };
  recipe: Recipe | null;
  decisions: ReviewDecision[];
};

function byteLength(value: string) { return new TextEncoder().encode(value).byteLength; }
function stableHash(value: string) {
  let first = 0x811c9dc5; let second = 0x9e3779b9;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

/** RFC 4180-style parser. Values remain strings; null is reserved for an absent field in a short row. */
export function parseCsv(text: string): CsvTable {
  if (byteLength(text) > RECONCILIATION_LIMITS.combinedBytes) throw new Error("CSV input exceeds the 10 MiB combined limit.");
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  if (source.length === 0) return { parserVersion: 1, headers: [], rows: [], diagnostics: ["The file is empty."] };
  const records: string[][] = [];
  let row: string[] = []; let field = ""; let quoted = false; let closedQuote = false; let atFieldStart = true; let fieldLength = 0;
  const pushField = () => {
    if (fieldLength > RECONCILIATION_LIMITS.cellCharacters) throw new Error("A CSV cell exceeds 1,000,000 characters.");
    row.push(field); field = ""; fieldLength = 0; atFieldStart = true; closedQuote = false;
    if (row.length > RECONCILIATION_LIMITS.columns) throw new Error("CSV files may contain at most 512 columns.");
  };
  const pushRow = () => { pushField(); records.push(row); row = []; if (records.length > RECONCILIATION_LIMITS.rows + 1) throw new Error("The two CSV files may contain at most 50,000 data rows combined."); };
  for (let index = 0; index < source.length; index++) {
    const character = source[index]!;
    if (quoted) {
      if (character === '"') {
        if (source[index + 1] === '"') { field += '"'; fieldLength++; index++; }
        else { quoted = false; closedQuote = true; }
      } else { field += character; fieldLength++; }
      continue;
    }
    if (closedQuote && character !== "," && character !== "\n" && character !== "\r") throw new Error("Unexpected text after a quoted CSV field.");
    if (character === '"' && !atFieldStart) throw new Error("A quote inside an unquoted field must be escaped in a quoted field.");
    if (character === '"' && atFieldStart) { quoted = true; atFieldStart = false; continue; }
    if (character === ",") { pushField(); continue; }
    if (character === "\n" || character === "\r") {
      pushRow();
      if (character === "\r" && source[index + 1] === "\n") index++;
      continue;
    }
    field += character; fieldLength++; atFieldStart = false;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  if (field.length > 0 || row.length > 0 || !/[\r\n]$/.test(source)) pushRow();
  const headerRecord = records.shift() ?? [];
  const width = Math.max(headerRecord.length, ...records.map(record => record.length), 0);
  if (width > RECONCILIATION_LIMITS.columns) throw new Error("CSV files may contain at most 512 columns.");
  const names = Array.from({ length: width }, (_, index) => headerRecord[index] ?? "");
  const seen = new Map<string, number>();
  const usedLabels = new Set<string>();
  const headers = names.map((sourceName, index): CsvHeader => {
    const occurrence = (seen.get(sourceName) ?? 0) + 1; seen.set(sourceName, occurrence);
    const base = sourceName === "" ? `Column ${index + 1}` : sourceName;
    let label = sourceName === "" || occurrence === 1 ? base : `${base} (${occurrence})`;
    while (usedLabels.has(label)) label += ` [${index + 1}]`;
    usedLabels.add(label);
    return { id: `column-${index + 1}`, sourceName, label, occurrence };
  });
  const diagnostics: string[] = [];
  if (headerRecord.length < width) diagnostics.push(`${width - headerRecord.length} unnamed header ${width - headerRecord.length === 1 ? "was" : "were"} added for wider rows.`);
  const duplicateCount = headers.filter(header => header.occurrence > 1).length;
  if (duplicateCount) diagnostics.push(`${duplicateCount} duplicate ${duplicateCount === 1 ? "header was" : "headers were"} numbered by occurrence.`);
  let shortRows = 0;
  const rows = records.map((record, index): CsvRow => {
    if (record.length < width) shortRows++;
    return { id: `row-${index + 2}`, sourceRow: index + 2, cells: Array.from({ length: width }, (_, column) => record[column] ?? null) };
  });
  if (shortRows) diagnostics.push(`${shortRows} ${shortRows === 1 ? "row has" : "rows have"} missing trailing fields; missing values remain distinct from empty cells.`);
  return { parserVersion: 1, headers, rows, diagnostics };
}

export function columnPairs(left: CsvTable, right: CsvTable, leftKeyId: string, rightKeyId: string): ColumnPair[] {
  const rightByIdentity = new Map(right.headers.map(header => [`${header.sourceName}\u0000${header.occurrence}`, header]));
  return left.headers.flatMap(header => {
    const other = rightByIdentity.get(`${header.sourceName}\u0000${header.occurrence}`);
    return header.id !== leftKeyId && other && other.id !== rightKeyId ? [{ leftId: header.id, rightId: other.id, label: header.label }] : [];
  });
}

function pairIdentity(pair: ColumnPair) { return `${pair.leftId}\u0000${pair.rightId}`; }
export function makeRecipe(left: CsvTable, right: CsvTable, leftKeyId: string, rightKeyId: string, selected?: ColumnPair[]): Recipe {
  if (!left.headers.some(header => header.id === leftKeyId) || !right.headers.some(header => header.id === rightKeyId)) throw new Error("Choose a key column from each source.");
  const available = columnPairs(left, right, leftKeyId, rightKeyId);
  const compare = selected ?? available;
  const selectedIds = new Set(compare.map(pairIdentity));
  const canonical = available.filter(pair => selectedIds.has(pairIdentity(pair)));
  if (selectedIds.size !== compare.length || JSON.stringify(compare) !== JSON.stringify(canonical)) throw new Error("Recipe comparison columns do not match the source schemas.");
  return { version: 1, match: "exact", leftKeyId, rightKeyId, compare: canonical };
}

function columnIndexes(table: CsvTable) {
  return new Map(table.headers.map((header, index) => [header.id, index]));
}
function requiredIndex(indexes: Map<string, number>, id: string) {
  const index = indexes.get(id);
  if (index === undefined) throw new Error(`Recipe column ${id} does not exist.`);
  return index;
}

export function comparisonFingerprint(leftHash: string, rightHash: string, recipe: Recipe) {
  return stableHash(JSON.stringify([leftHash, rightHash, recipe]));
}

export function compareTables(left: ReconciliationSource, right: ReconciliationSource, recipe: Recipe): Comparison {
  const leftIndexes = columnIndexes(left.table); const rightIndexes = columnIndexes(right.table);
  const leftKeyIndex = requiredIndex(leftIndexes, recipe.leftKeyId); const rightKeyIndex = requiredIndex(rightIndexes, recipe.rightKeyId);
  const compared = recipe.compare.map(pair => ({ ...pair, leftIndex: requiredIndex(leftIndexes, pair.leftId), rightIndex: requiredIndex(rightIndexes, pair.rightId) }));
  const leftGroups = new Map<CsvCell, CsvRow[]>(); const rightGroups = new Map<CsvCell, CsvRow[]>();
  const append = (groups: Map<CsvCell, CsvRow[]>, key: CsvCell, row: CsvRow) => { const records = groups.get(key); if (records) records.push(row); else groups.set(key, [row]); };
  left.table.rows.forEach(row => { append(leftGroups, row.cells[leftKeyIndex] ?? null, row); });
  right.table.rows.forEach(row => { append(rightGroups, row.cells[rightKeyIndex] ?? null, row); });
  const keys = [...leftGroups.keys(), ...[...rightGroups.keys()].filter(key => !leftGroups.has(key))];
  // Include independently derived content fingerprints so an imported hash label cannot preserve stale decisions.
  const fingerprint = comparisonFingerprint(`${left.hash}:${stableHash(left.text)}`, `${right.hash}:${stableHash(right.text)}`, recipe);
  const groups = keys.map((key): ResultGroup => {
    const leftRows = leftGroups.get(key) ?? []; const rightRows = rightGroups.get(key) ?? [];
    let category: Category; let differences: string[] = [];
    if (key === null || key === "" || leftRows.length > 1 || rightRows.length > 1) category = "ambiguous";
    else if (leftRows.length === 0 || rightRows.length === 0) category = "missing";
    else {
      differences = compared.filter(pair => (leftRows[0]!.cells[pair.leftIndex] ?? null) !== (rightRows[0]!.cells[pair.rightIndex] ?? null)).map(pair => pair.label);
      category = differences.length ? "conflicting" : "matched";
    }
    const id = `${category}-${stableHash(JSON.stringify([fingerprint, key, leftRows.map(row => row.id), rightRows.map(row => row.id)]))}`;
    return { id, category, key, left: leftRows, right: rightRows, differences };
  });
  const categories = { matched: 0, missing: 0, conflicting: 0, ambiguous: 0 };
  for (const group of groups) categories[group.category]++;
  return { fingerprint, groups, totals: { ...categories, leftRows: left.table.rows.length, rightRows: right.table.rows.length, outputRows: left.table.rows.length + right.table.rows.length } };
}

export function reconcileDecisions(decisions: ReviewDecision[], comparison: Comparison): ReviewDecision[] {
  const ids = new Set(comparison.groups.map(group => group.id));
  return decisions.filter(decision => decision.fingerprint === comparison.fingerprint && ids.has(decision.groupId));
}

function csvValue(value: string) { return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value; }
export function serializeCsv(rows: string[][]) { return rows.map(row => row.map(csvValue).join(",")).join("\r\n") + "\r\n"; }
export function neutralizeFormula(value: string) { return /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value; }

export function exportComparison(comparison: Comparison, left: ReconciliationSource, right: ReconciliationSource, decisions: ReviewDecision[], spreadsheetSafe = false) {
  const active = new Map(reconcileDecisions(decisions, comparison).map(decision => [decision.groupId, decision]));
  const identity = (header: CsvHeader) => JSON.stringify([header.sourceName, header.occurrence]);
  const columns = new Map<string, string>();
  for (const header of [...left.table.headers, ...right.table.headers]) {
    const id = identity(header);
    if (!columns.has(id)) columns.set(id, `data:${id}`);
  }
  const allLabels = [...columns.keys()];
  const header = ["result", "group_id", "key", "key_state", "side", "source_row", "row_id", "decision", "decision_note", "missing_fields", ...columns.values()];
  const output = [header];
  for (const group of comparison.groups) {
    const decision = active.get(group.id);
    for (const [side, source, rows] of [["left", left, group.left], ["right", right, group.right]] as const) {
      for (const row of rows) {
        const byLabel = new Map(source.table.headers.map((item, index) => [identity(item), row.cells[index] ?? null]));
        const missing = allLabels.filter(label => !byLabel.has(label) || byLabel.get(label) === null);
        output.push([group.category, group.id, group.key ?? "", group.key === null ? "missing" : group.key === "" ? "empty" : "present", side, String(row.sourceRow), row.id, decision?.status ?? "unreviewed", decision?.note ?? "", JSON.stringify(missing.map(value => columns.get(value))), ...allLabels.map(label => byLabel.get(label) ?? "")]);
      }
    }
  }
  const transformed = spreadsheetSafe ? output.map((row, rowIndex) => row.map(value => rowIndex === 0 ? value : neutralizeFormula(value))) : output;
  return serializeCsv(transformed);
}

export function exportRecipe(recipe: Recipe) {
  return JSON.stringify({ schema: "vlak.reconciliation-recipe", version: 1, recipe }, null, 2) + "\n";
}

export async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
}

function object(value: unknown, path: string): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object.`); return value as Record<string, unknown>; }
function keys(value: Record<string, unknown>, allowed: string[], path: string) { for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${path} contains unsupported field ${key}.`); for (const key of allowed) if (!(key in value)) throw new Error(`${path}.${key} is required.`); }
function string(value: unknown, path: string, max: number, blank = true) { if (typeof value !== "string" || value.length > max || (!blank && !value.trim())) throw new Error(`${path} must be ${blank ? "a" : "a nonblank"} string of at most ${max} characters.`); return value; }
function integer(value: unknown, path: string, max: number) { if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > max) throw new Error(`${path} must be a bounded finite integer.`); return value; }
function exactTable(value: unknown, parsed: CsvTable, path: string): CsvTable { const candidate = object(value, path); keys(candidate, ["parserVersion", "headers", "rows", "diagnostics"], path); if (JSON.stringify(candidate) !== JSON.stringify(parsed)) throw new Error(`${path} does not match the immutable source text.`); return parsed; }
function parseSource(value: unknown, path: string): ReconciliationSource | null {
  if (value === null) return null;
  const source = object(value, path); keys(source, ["name", "size", "hash", "text", "table"], path);
  const name = string(source.name, `${path}.name`, RECONCILIATION_LIMITS.nameCharacters, false);
  const size = integer(source.size, `${path}.size`, RECONCILIATION_LIMITS.combinedBytes);
  const hash = string(source.hash, `${path}.hash`, 64, false); if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error(`${path}.hash must be a SHA-256 value.`);
  const text = string(source.text, `${path}.text`, RECONCILIATION_LIMITS.combinedBytes);
  if (byteLength(text) !== size) throw new Error(`${path}.size does not match its encoded source bytes.`);
  const table = exactTable(source.table, parseCsv(text), `${path}.table`);
  return { name, size, hash, text, table };
}
function parseRecipe(value: unknown, left: ReconciliationSource | null, right: ReconciliationSource | null): Recipe | null {
  if (value === null) return null;
  if (!left || !right) throw new Error("A recipe requires both sources.");
  const recipe = object(value, "recipe"); keys(recipe, ["version", "match", "leftKeyId", "rightKeyId", "compare"], "recipe");
  if (recipe.version !== 1 || recipe.match !== "exact") throw new Error("Only version 1 exact-match recipes are supported.");
  const leftKeyId = string(recipe.leftKeyId, "recipe.leftKeyId", 64, false); const rightKeyId = string(recipe.rightKeyId, "recipe.rightKeyId", 64, false);
  if (!Array.isArray(recipe.compare) || recipe.compare.length > RECONCILIATION_LIMITS.columns) throw new Error("recipe.compare must be a bounded array.");
  const compare = recipe.compare.map((value, index): ColumnPair => { const pair = object(value, `recipe.compare[${index}]`); keys(pair, ["leftId", "rightId", "label"], `recipe.compare[${index}]`); return { leftId: string(pair.leftId, "leftId", 64, false), rightId: string(pair.rightId, "rightId", 64, false), label: string(pair.label, "label", 180) }; });
  return makeRecipe(left.table, right.table, leftKeyId, rightKeyId, compare);
}

export function parseReconciliationProject(input: unknown): ReconciliationProject {
  let value = input;
  if (typeof input === "string") { if (byteLength(input) > 16 * 1024 * 1024) throw new Error("Project is too large."); try { value = JSON.parse(input); } catch { throw new Error("Project is not valid JSON."); } }
  const root = object(value, "project"); keys(root, ["schema", "version", "title", "sources", "recipe", "decisions"], "project");
  if (root.schema !== "vlak.reconciliation" || root.version !== 1) throw new Error("Expected a vlak.reconciliation version 1 project.");
  const sourcesObject = object(root.sources, "sources"); keys(sourcesObject, ["left", "right"], "sources");
  const left = parseSource(sourcesObject.left, "sources.left"); const right = parseSource(sourcesObject.right, "sources.right");
  if ((left?.size ?? 0) + (right?.size ?? 0) > RECONCILIATION_LIMITS.combinedBytes) throw new Error("Sources exceed the 10 MiB combined limit.");
  if ((left?.table.rows.length ?? 0) + (right?.table.rows.length ?? 0) > RECONCILIATION_LIMITS.rows) throw new Error("Sources exceed the 50,000-row combined limit.");
  const recipe = parseRecipe(root.recipe, left, right);
  if (!Array.isArray(root.decisions) || root.decisions.length > RECONCILIATION_LIMITS.decisions) throw new Error("decisions must be a bounded array.");
  const comparison = left && right && recipe ? compareTables(left, right, recipe) : null;
  const decisions = root.decisions.map((value, index): ReviewDecision => { const decision = object(value, `decisions[${index}]`); keys(decision, ["groupId", "fingerprint", "status", "note"], `decisions[${index}]`); const status = decision.status; if (status !== "reviewed" && status !== "follow-up") throw new Error("Decision status must be reviewed or follow-up."); return { groupId: string(decision.groupId, "groupId", 96, false), fingerprint: string(decision.fingerprint, "fingerprint", 32, false), status, note: string(decision.note, "note", RECONCILIATION_LIMITS.noteCharacters) }; });
  if (!comparison && decisions.length) throw new Error("Decisions require a valid comparison.");
  if (comparison && reconcileDecisions(decisions, comparison).length !== decisions.length) throw new Error("Decisions do not belong to these exact inputs and recipe.");
  if (new Set(decisions.map(decision => decision.groupId)).size !== decisions.length) throw new Error("Decisions must have unique group IDs.");
  return { schema: "vlak.reconciliation", version: 1, title: string(root.title, "title", 120, false), sources: { left, right }, recipe, decisions };
}

export function initialProject(): ReconciliationProject { return { schema: "vlak.reconciliation", version: 1, title: "Inventory reconciliation", sources: { left: null, right: null }, recipe: null, decisions: [] }; }
export function shouldAcceptJob(activeJobId: number, resultJobId: number) { return activeJobId === resultJobId; }

export function readRecipe(source: string, left: ReconciliationSource | null, right: ReconciliationSource | null): Recipe {
  if (byteLength(source) > 262144) throw new Error("Recipe files must be 256 KiB or smaller.");
  const root = object(JSON.parse(source), "recipe file");
  keys(root, ["schema", "version", "recipe"], "recipe file");
  if (root.schema !== "vlak.reconciliation-recipe" || root.version !== 1) throw new Error("Unsupported recipe file.");
  const recipe = parseRecipe(root.recipe, left, right);
  if (!recipe) throw new Error("Recipe is missing.");
  return recipe;
}
