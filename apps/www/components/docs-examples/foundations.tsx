"use client";

import * as React from "react";
import { vlakTokens } from "@noorddev/vlak";
import { Button, Field, FieldError, FieldHint, FieldLabel, Input } from "@noorddev/vlak-react";
import styles from "./foundations.module.css";

export function AccessibilityFocusExample() {
  const inputId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState(false);
  const [status, setStatus] = React.useState("Tab through the field and actions, then submit.");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError(true);
      setStatus("Name is required. Focus returned to the field.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setError(false);
    setStatus(`Saved for ${name.trim()}.`);
  }

  function reset() {
    setName("");
    setError(false);
    setStatus("Example reset. Focus returned to the field.");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className={styles.focusLayout}>
      <form className={styles.focusForm} noValidate onSubmit={submit}>
        <Field>
          <FieldLabel htmlFor={inputId}>Reviewer name</FieldLabel>
          <Input
            ref={inputRef}
            plain
            id={inputId}
            value={name}
            aria-invalid={error || undefined}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(false);
            }}
          />
          {error ? <FieldError>Enter a name before saving.</FieldError> : <FieldHint>The hint is connected to the input.</FieldHint>}
        </Field>
        <div className={styles.actions}>
          <Button type="submit">Save</Button>
          <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
        </div>
      </form>
      <div className={styles.focusMap} role="group" aria-label="Keyboard focus order">
        <span>1 · Label names the input</span>
        <span>2 · Tab reaches Save</span>
        <span>3 · Tab reaches Reset</span>
        <p role="status" aria-live="polite">{status}</p>
      </div>
    </div>
  );
}

export function FrameworkControlExample() {
  const [activations, setActivations] = React.useState(0);
  const [last, setLast] = React.useState("No control activated yet.");

  function activate(source: string) {
    setActivations((current) => current + 1);
    setLast(`${source} activated.`);
  }

  return (
    <div className={styles.frameworkExample}>
      <div className={styles.frameworkColumn}>
        <code>React</code>
        <Button type="button" onClick={() => activate("React component")}>Save with Button</Button>
        <span>Imports the component from <code>@noorddev/vlak-react</code>.</span>
      </div>
      <div className={styles.frameworkColumn}>
        <code>HTML</code>
        <button type="button" className="rs-btn-primary" onClick={() => activate("HTML class")}>Save with a class</button>
        <span>Uses the stable <code>rs-btn-primary</code> class from vlak.css.</span>
      </div>
      <p className={styles.fullStatus} role="status">{last} Total activations: {activations}.</p>
    </div>
  );
}

export function CascadeLayerExample() {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const [appLayer, setAppLayer] = React.useState(true);
  const [computed, setComputed] = React.useState("");

  React.useEffect(() => {
    if (!targetRef.current) return;
    const value = window.getComputedStyle(targetRef.current);
    setComputed(`${appLayer ? "App layer active" : "Component layer active"}. Computed fill ${value.backgroundColor}; corner ${value.borderRadius}.`);
  }, [appLayer]);

  return (
    <div className={styles.cascadeExample}>
      <div className={styles.ruleStack} role="group" aria-label="Cascade layer order">
        <div>
          <span>Earlier</span>
          <code>@layer component</code>
          <small>Paper fill · 12px corner</small>
        </div>
        <div data-active={appLayer || undefined}>
          <span>Later</span>
          <code>@layer app</code>
          <small>Ink fill · square corner</small>
        </div>
      </div>
      <div className={styles.cascadeStage}>
        <div ref={targetRef} className={`${styles.cascadeTarget} ${appLayer ? styles.cascadeApp : ""}`}>
          The later active layer wins
        </div>
        <Button type="button" variant="ghost" aria-pressed={appLayer} onClick={() => setAppLayer((current) => !current)}>
          {appLayer ? "Remove app layer" : "Add app layer"}
        </Button>
        <p role="status">{computed}</p>
      </div>
    </div>
  );
}

const stylexLeaf = `const styles = stylex.create({
  panel: {
    padding: vlak.pad,
    color: vlak.ink,
    backgroundColor: vlak.paper,
  },
});

<section {...stylex.props(styles.panel)} />`;

const stylexOutput = `/* Simplified output: one representative rule per value */
@layer priority1 {
  .x-padding { padding: var(--pad) }
  .x-color { color: var(--text) }
  .x-paper { background-color: var(--bg) }
}

<section class="x-padding x-color x-paper">`;

export function StylexCompileExample() {
  const [view, setView] = React.useState<"leaf" | "output">("leaf");
  return (
    <div className={styles.compileExample}>
      <div className={styles.viewChoices} role="group" aria-label="StyleX example view">
        <Button type="button" variant={view === "leaf" ? "primary" : "ghost"} aria-pressed={view === "leaf"} onClick={() => setView("leaf")}>Source leaf</Button>
        <Button type="button" variant={view === "output" ? "primary" : "ghost"} aria-pressed={view === "output"} onClick={() => setView("output")}>Simplified output</Button>
      </div>
      <pre tabIndex={0}><code>{view === "leaf" ? stylexLeaf : stylexOutput}</code></pre>
      <p>{view === "leaf" ? "Tokens stay as custom-property references in the leaf." : "This simplified view keeps the concept visible. Atomic class identifiers vary by build."}</p>
    </div>
  );
}

type ThemeChoice = "light" | "dark";
type ScaleChoice = "desktop" | "phone";

export function ThemeSandboxExample() {
  const [theme, setTheme] = React.useState<ThemeChoice>("light");
  const [scale, setScale] = React.useState<ScaleChoice>("desktop");
  const inputId = React.useId();
  const light = vlakTokens.color.light;
  const dark = vlakTokens.color.dark;
  const control = vlakTokens.control[scale];
  const localVars = {
    "--bg": theme === "dark" ? dark.black : light.paper,
    "--text": theme === "dark" ? dark.white : light.ink,
    "--text-secondary": theme === "dark" ? dark.gray : light.gray,
    "--divider": theme === "dark" ? dark.divider : light.divider,
    "--divider-subtle": theme === "dark" ? dark.dividerSubtle : light.dividerSubtle,
    "--control-border": theme === "dark" ? dark.controlBorder : light.controlBorder,
    "--control-fill": theme === "dark" ? dark.controlFill : light.controlFill,
    "--control-h": `${control.height}px`,
    "--control-fs": `${control.font}px`,
    "--control-label": `${control.label}px`,
    "--hit": `${control.hit}px`,
    colorScheme: theme,
  } as React.CSSProperties;

  return (
    <div className={styles.themeExample}>
      <div className={styles.sandboxChoices}>
        <div role="group" aria-label="Local theme">
          <Button type="button" variant={theme === "light" ? "primary" : "ghost"} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</Button>
          <Button type="button" variant={theme === "dark" ? "primary" : "ghost"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</Button>
        </div>
        <div role="group" aria-label="Local control scale">
          <Button type="button" variant={scale === "desktop" ? "primary" : "ghost"} aria-pressed={scale === "desktop"} onClick={() => setScale("desktop")}>14px controls</Button>
          <Button type="button" variant={scale === "phone" ? "primary" : "ghost"} aria-pressed={scale === "phone"} onClick={() => setScale("phone")}>16px controls</Button>
        </div>
      </div>
      <div className={styles.themeSandbox} style={localVars} data-local-theme={theme}>
        <span>Scoped preview · {theme} · {control.font}px control type</span>
        <Field>
          <FieldLabel htmlFor={inputId}>Project name</FieldLabel>
          <Input plain id={inputId} defaultValue="North quay review" />
          <FieldHint>Only this framed preview receives the token overrides.</FieldHint>
        </Field>
        <Button type="button">Save project</Button>
      </div>
    </div>
  );
}

export function TokenGridExample() {
  const [dimensions, setDimensions] = React.useState(true);
  return (
    <div className={styles.tokenExample}>
      <div className={styles.tokenToolbar}>
        <p><strong>{vlakTokens.grid.module}px module</strong><span>{vlakTokens.grid.column}px column + {vlakTokens.grid.gutter}px gutter</span></p>
        <Button type="button" variant="ghost" aria-pressed={dimensions} onClick={() => setDimensions((current) => !current)}>
          {dimensions ? "Hide dimensions" : "Show dimensions"}
        </Button>
      </div>
      <div className={styles.gridRatio} role="img" data-dimensions={dimensions || undefined} aria-label="Two Vlak columns separated by a gutter">
        <div><span>{dimensions ? `${vlakTokens.grid.column}px column` : "Content"}</span></div>
        <div><span>{dimensions ? `${vlakTokens.grid.gutter}px` : ""}</span></div>
        <div><span>{dimensions ? `${vlakTokens.grid.column}px column` : "Content"}</span></div>
      </div>
      <p>Two content columns and their gutter form a {vlakTokens.grid.module * 2 - vlakTokens.grid.gutter}px box.</p>
    </div>
  );
}
