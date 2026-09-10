"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Button, Command, Dialog, Icon } from "@noorddev/vlak-react";
import { searchSite, type SiteSearchEntry } from "@/lib/site-search";

let indexRequest: Promise<SiteSearchEntry[]> | undefined;

/** One static download per tab. Search terms never leave the browser. */
function loadSearchIndex() {
  if (!indexRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    indexRequest = fetch("/search-index.json", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Search index unavailable");
        const entries: unknown = await response.json();
        if (!Array.isArray(entries) || !entries.every(entry => entry && typeof entry.title === "string"
          && typeof entry.description === "string" && typeof entry.section === "string"
          && typeof entry.href === "string" && /^\/(?!\/)/.test(entry.href))) {
          throw new Error("Search index invalid");
        }
        return entries as SiteSearchEntry[];
      })
      .catch(error => { indexRequest = undefined; throw error; })
      .finally(() => clearTimeout(timeout));
  }
  return indexRequest;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
const isEditing = (target: EventTarget | null) => target instanceof HTMLElement
  && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [role="textbox"], [role="combobox"]')));

export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [entries, setEntries] = React.useState<SiteSearchEntry[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [retry, setRetry] = React.useState(0);
  const [shortcut, setShortcut] = React.useState("⌘ K");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const restoreRef = React.useRef<HTMLElement | null>(null);
  const restoreFrame = React.useRef<number | null>(null);
  const previousPath = React.useRef(pathname);
  const results = React.useMemo(() => searchSite(entries ?? [], query), [entries, query]);

  useIsoLayoutEffect(() => {
    setReady(true);
    setShortcut(/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? "⌘ K" : "Ctrl K");
  }, []);

  const cancelRestore = React.useCallback(() => {
    if (restoreFrame.current !== null) cancelAnimationFrame(restoreFrame.current);
    restoreFrame.current = null;
  }, []);
  React.useEffect(() => cancelRestore, [cancelRestore]);

  const closeSearch = React.useCallback((restore = true) => {
    cancelRestore();
    setOpen(false);
    if (restore) restoreFrame.current = requestAnimationFrame(() => {
      restoreFrame.current = null;
      const target = restoreRef.current;
      if (target?.isConnected && target.getClientRects().length && !target.closest("[inert], [hidden]")) {
        target.focus({ preventScroll: true });
      } else triggerRef.current?.focus({ preventScroll: true });
    });
  }, [cancelRestore]);

  const openSearch = React.useCallback((opener?: HTMLElement) => {
    cancelRestore();
    restoreRef.current = opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    window.dispatchEvent(new CustomEvent("vlak:navigation-open", { detail: "search" }));
    setQuery("");
    setFailed(false);
    setOpen(true);
  }, [cancelRestore]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      // Fullscreen studies and standalone canvases own their own shortcuts.
      if (!triggerRef.current?.getClientRects().length || triggerRef.current.closest("[inert]")) return;
      const shortcutKey = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !isEditing(event.target);
      if (!shortcutKey && (!slash || open)) return;
      if (Array.from(document.querySelectorAll("dialog[open]")).some(dialog => dialog !== dialogRef.current)) return;
      event.preventDefault();
      if (open) closeSearch();
      else openSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, openSearch, closeSearch]);

  React.useEffect(() => {
    if (pathname === previousPath.current) return;
    previousPath.current = pathname;
    closeSearch(false);
  }, [pathname, closeSearch]);

  React.useEffect(() => {
    const onNavigation = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "search") closeSearch(false);
    };
    window.addEventListener("vlak:navigation-open", onNavigation);
    return () => window.removeEventListener("vlak:navigation-open", onNavigation);
  }, [closeSearch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry explicitly starts a new request after a failure.
  React.useEffect(() => {
    if (!open || entries) return;
    let active = true;
    setFailed(false);
    loadSearchIndex().then(data => { if (active) setEntries(data); }, () => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [open, entries, retry]);

  React.useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const update = () => {
      dialogRef.current?.style.setProperty("--search-viewport-height", `${viewport?.height ?? window.innerHeight}px`);
      dialogRef.current?.style.setProperty("--search-viewport-top", `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    dialogRef.current?.querySelector<HTMLInputElement>('[role="combobox"]')?.focus({ preventScroll: true });
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => { viewport?.removeEventListener("resize", update); viewport?.removeEventListener("scroll", update); };
  }, [open]);

  const select = (entry: SiteSearchEntry) => {
    closeSearch(false);
    router.push(entry.href);
  };
  const loading = !entries && !failed;

  return <div className="global-search">
    <button ref={triggerRef} type="button" className="global-search-trigger" disabled={!ready}
      aria-label="Search Vlak" aria-haspopup="dialog" aria-expanded={open} aria-controls="global-search-dialog"
      aria-keyshortcuts="Meta+K Control+K" aria-busy={!ready || undefined}
      title={`Search Vlak (${shortcut})`} onClick={event => openSearch(event.currentTarget)}
      onPointerEnter={() => { void loadSearchIndex().catch(() => {}); }}
      onFocus={() => { void loadSearchIndex().catch(() => {}); }}>
      <Icon name="search" size={16} /><span className="global-search-trigger-label">Search</span>
      <kbd className="global-search-shortcut">{shortcut}</kbd>
    </button>
    <Dialog ref={dialogRef} id="global-search-dialog" className="global-search-dialog" open={open}
      onClose={() => closeSearch()} aria-label="Search Vlak" lightDismiss
      onClick={event => {
        // Native light dismiss is progressive; keep backdrop clicks working on older browsers.
        if (event.target !== event.currentTarget) return;
        const box = event.currentTarget.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeSearch();
      }}>
      {open && <>
        <div className="global-search-field">
          <span className="global-search-mark" aria-hidden="true"><Icon name="search" size={24} /></span>
          <Button className="global-search-close" variant="subtle" size="icon" aria-label="Close search" onClick={() => closeSearch()}>
            <Icon name="close" size={16} />
          </Button>
          <Command className="global-search-command" inputLabel="Search Vlak" placeholder="Search Vlak…"
            value={query} onValueChange={setQuery} shouldFilter={false} onDone={() => closeSearch()}
            groups={results.length ? [{ label: query.trim() ? "Results" : "Jump to", items: results.map(entry => ({
              id: entry.id, label: entry.title, description: entry.description, hint: entry.section, onSelect: () => select(entry),
            })) }] : []}
            emptyLabel={loading ? "Loading search…" : failed ? "Search could not load. Try again." : "No results. Try another name or feature."} />
        </div>
        <div className="global-search-footer">
          <span role="status" aria-live="polite">{loading ? "Loading search" : failed ? "Search unavailable" : query.trim() ? `${results.length} ${results.length === 1 ? "result" : "results"}` : "Components, AI, docs, and interfaces"}</span>
          {failed ? <Button variant="subtle" size="sm" onClick={() => {
            // Retry removes this button; keep typing possible while the index reloads.
            dialogRef.current?.querySelector<HTMLInputElement>('[role="combobox"]')?.focus({ preventScroll: true });
            setRetry(value => value + 1);
          }}>Retry search</Button>
            : <span className="global-search-help" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>esc</kbd> Close</span></span>}
        </div>
      </>}
    </Dialog>
  </div>;
}
