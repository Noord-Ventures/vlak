export interface TerminalAttributes { bold?: boolean; dim?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; inverse?: boolean; foreground?: string; background?: string }
export interface TerminalRun extends TerminalAttributes { text: string }
export interface TerminalParserState { mode: "text" | "escape" | "csi" | "osc" | "osc-escape"; parameters: string; attributes: TerminalAttributes; runs: TerminalRun[] }

export function createTerminalParser(): TerminalParserState { return { mode: "text", parameters: "", attributes: {}, runs: [] }; }

function ansiColor(index: number | undefined): string | undefined {
  if (index === undefined || !Number.isInteger(index) || index < 0 || index > 255) return undefined;
  const basic = [[0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0], [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192], [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0], [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255]];
  if (index < 16) return `rgb(${basic[index]!.join(", ")})`;
  if (index >= 232) { const gray = 8 + (index - 232) * 10; return `rgb(${gray}, ${gray}, ${gray})`; }
  const cube = index - 16;
  const channel = (n: number) => n === 0 ? 0 : 55 + n * 40;
  return `rgb(${channel(Math.floor(cube / 36))}, ${channel(Math.floor(cube / 6) % 6)}, ${channel(cube % 6)})`;
}
function applySgr(state: TerminalParserState) {
  const values = (state.parameters || "0").replace(/(38|48):2::/g, "$1;2;").replaceAll(":", ";").split(";").map(value => Number(value || "0"));
  for (let index = 0; index < values.length; index++) {
    const value = values[index]!;
    const attrs = state.attributes;
    if (value === 0) state.attributes = {};
    else if (value === 1) attrs.bold = true;
    else if (value === 2) attrs.dim = true;
    else if (value === 3) attrs.italic = true;
    else if (value === 4 || value === 21) attrs.underline = true;
    else if (value === 7) attrs.inverse = true;
    else if (value === 9) attrs.strike = true;
    else if (value === 22) { delete attrs.bold; delete attrs.dim; }
    else if (value === 23) delete attrs.italic;
    else if (value === 24) delete attrs.underline;
    else if (value === 27) delete attrs.inverse;
    else if (value === 29) delete attrs.strike;
    else if (value === 39) delete attrs.foreground;
    else if (value === 49) delete attrs.background;
    else if (value >= 30 && value <= 37) attrs.foreground = ansiColor(value - 30);
    else if (value >= 90 && value <= 97) attrs.foreground = ansiColor(value - 90 + 8);
    else if (value >= 40 && value <= 47) attrs.background = ansiColor(value - 40);
    else if (value >= 100 && value <= 107) attrs.background = ansiColor(value - 100 + 8);
    else if (value === 38 || value === 48) {
      const key = value === 38 ? "foreground" : "background";
      if (values[index + 1] === 5) { attrs[key] = ansiColor(values[index + 2]); index += 2; }
      else if (values[index + 1] === 2) {
        const rgb = values.slice(index + 2, index + 5);
        if (rgb.length === 3 && rgb.every(channel => Number.isInteger(channel) && channel >= 0 && channel <= 255)) attrs[key] = `rgb(${rgb.join(", ")})`;
        index += 4;
      }
    }
  }
}

/** Incremental SGR output parser. OSC (including clipboard and hyperlink commands) is discarded. */
export function appendTerminalOutput(previous: TerminalParserState, text: string): TerminalParserState {
  const state: TerminalParserState = { ...previous, attributes: { ...previous.attributes }, runs: [...previous.runs] };
  let buffered = "";
  const flush = () => {
    if (!buffered) return;
    const last = state.runs.at(-1);
    const { text: _previousText, ...lastAttributes } = last ?? { text: "" };
    if (last && JSON.stringify(lastAttributes) === JSON.stringify(state.attributes)) state.runs[state.runs.length - 1] = { ...last, text: last.text + buffered };
    else state.runs.push({ ...state.attributes, text: buffered });
    buffered = "";
  };
  for (const character of text) {
    if (state.mode === "osc") { if (character === "\u0007") state.mode = "text"; else if (character === "\u001b") state.mode = "osc-escape"; continue; }
    if (state.mode === "osc-escape") { state.mode = character === "\\" ? "text" : character === "\u001b" ? "osc-escape" : "osc"; continue; }
    if (state.mode === "escape") { state.mode = character === "[" ? "csi" : character === "]" ? "osc" : "text"; state.parameters = ""; continue; }
    if (state.mode === "csi") {
      if (character >= "@" && character <= "~") { if (character === "m") applySgr(state); state.parameters = ""; state.mode = "text"; }
      else if (state.parameters.length < 128) state.parameters += character;
      continue;
    }
    if (character === "\u001b") { flush(); state.mode = "escape"; }
    else if (character === "\n" || character === "\t" || character >= " " && character !== "\u007f") buffered += character;
  }
  flush();
  return state;
}
