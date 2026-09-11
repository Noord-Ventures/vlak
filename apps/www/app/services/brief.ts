export const BRIEF_FORMAT = "vlak-modernization-brief-v1" as const;
export const BRIEF_LIMITS = { bytes: 262144, string: 10000 } as const;

export type ModernizationBrief = {
  namedProblem: string; currentProcess: string; users: string; inputOutput: string;
  acceptance: string; dependencies: string; owner: string; rollout: string; support: string;
};

export const BRIEF_KEYS = ["namedProblem", "currentProcess", "users", "inputOutput", "acceptance", "dependencies", "owner", "rollout", "support"] as const;

function exactRecord(value: unknown, keys: readonly string[], path: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path}: expected an object.`);
  const record = value as Record<string, unknown>;
  const extra = Object.keys(record).find(key => !keys.includes(key));
  if (extra) throw new Error(`${path}.${extra}: unsupported field.`);
  for (const key of keys) if (!Object.hasOwn(record, key)) throw new Error(`${path}.${key}: field is required.`);
  return record;
}

export function parseBrief(value: unknown): ModernizationBrief {
  const raw = JSON.stringify(value);
  if (raw === undefined || new TextEncoder().encode(raw).byteLength > BRIEF_LIMITS.bytes) throw new Error("Brief files must be 256 KiB or smaller.");
  let record: Record<string, unknown>;
  if (value !== null && typeof value === "object" && !Array.isArray(value) && (Object.hasOwn(value, "format") || Object.hasOwn(value, "data"))) {
    record = exactRecord(value, ["format", "data"], "brief file");
    if (record.format !== BRIEF_FORMAT) throw new Error(`Expected format ${BRIEF_FORMAT}.`);
    record = exactRecord(record.data, BRIEF_KEYS, "brief file.data");
  } else record = exactRecord(value, BRIEF_KEYS, "brief");
  const output = {} as ModernizationBrief;
  for (const key of BRIEF_KEYS) {
    const text = record[key];
    if (typeof text !== "string") throw new Error(`brief.${key}: expected text.`);
    if (text.length > BRIEF_LIMITS.string) throw new Error(`brief.${key}: text exceeds ${BRIEF_LIMITS.string} characters.`);
    output[key] = text;
  }
  return output;
}
