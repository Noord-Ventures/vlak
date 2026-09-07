"use client";

import * as React from "react";
import { Button, Card, Checkbox, Icon, Input, NumberField, Select, ToggleGroup } from "@noorddev/vlak-react";

type Method = "delivery" | "pickup";
type Diet = "any" | "grill" | "seasonal" | "bakery" | "burgers";
type View = "browse" | "menu" | "filters" | "item" | "bag" | "receipt";
type Store = { id: string; name: string; area: string; address: string; website: string; menuSource: string; about: string; photo: string; fee: number; eta: string; diet: Diet; price: 1 | 2; dish: string; samplePrices?: boolean };
type Item = { id: string; name: string; note: string; photo: string; price: number; cat: string };
type Line = { key: string; storeId: string; itemId: string; name: string; price: number; quantity: number; method: Method };
type Receipt = { lines: Line[]; subtotal: number; fees: number; total: number };

const STORES: Store[] = [
  { id: "joes-kitchen", name: "Joe's Kitchen", area: "Alkmaar", address: "Berenkoog 35, 1822 BH Alkmaar", website: "https://www.joeskitchenalkmaar.nl/", menuSource: "https://www.joeskitchenalkmaar.nl/", about: "Caribbean, Antillean, and Surinamese cooking, with grilled chicken and familiar rice dishes.", photo: "/interfaces/food/joes-kitchen-v2.png", fee: 240, eta: "25–35 min", diet: "grill", price: 1, dish: "Caribbean grill and rice dishes" },
  { id: "neder", name: "Neder", area: "Alkmaar", address: "Laat 85, 1811 EC Alkmaar", website: "https://www.nederrestaurant.nl/", menuSource: "https://www.nederrestaurant.nl/_files/ugd/4ebc17_ed06571345364446abd2b16c9c1474ab.pdf", about: "Seasonal Dutch ingredients guide the menu, with local produce, foraging, and fermentation.", photo: "/interfaces/food/neder-v2.png", fee: 290, eta: "35–45 min", diet: "seasonal", price: 2, dish: "Local, seasonal, a little unexpected" },
  { id: "la-dune", name: "La Dune", area: "Bergen", address: "Ruïnelaan 7, 1861 LK Bergen", website: "https://ladunebergen.nl/", menuSource: "https://ladunebergen.nl/", about: "A French sourdough bakery and patisserie, with a fresh market and natural wine.", photo: "/interfaces/food/la-dune-v2.png", fee: 190, eta: "20–30 min", diet: "bakery", price: 1, dish: "Sourdough, patisserie, and the market", samplePrices: true },
  { id: "jackys", name: "Jacky's", area: "Alkmaar", address: "Huiswaardersplein 1, 1823 CP Alkmaar", website: "https://jackyalkmaar.nl/", menuSource: "https://jackyalkmaar.nl/wp-content/uploads/2026/05/Menukaart-Jacky-2026-DEF.pdf", about: "Trading as Jacky Alkmaar, with burgers, sides, and a vegan burger on its published menu.", photo: "/interfaces/food/jackys-v2.png", fee: 240, eta: "25–35 min", diet: "burgers", price: 1, dish: "Smash burgers and something on the side" },
];

const MENUS: Record<string, Item[]> = {
  "joes-kitchen": [
    { id: "chicken", name: "Grilled chicken filet large", note: "A large grilled chicken portion", photo: "/interfaces/food/joes-chicken-v1.jpg", price: 15, cat: "Grill" },
    { id: "wings", name: "BBQ chicken wings with fries", note: "Barbecue chicken wings, served with fries", photo: "/interfaces/food/joes-wings-v1.jpg", price: 14, cat: "Grill" },
    { id: "nasi", name: "Nasi kipsaté", note: "Nasi rice with chicken satay", photo: "/interfaces/food/joes-nasi-v1.jpg", price: 13, cat: "Rice dishes" },
  ],
  neder: [
    { id: "beet", name: "Beet teriyaki", note: "A beet dish from the published seasonal menu", photo: "/interfaces/food/neder-beet-v1.jpg", price: 17, cat: "Seasonal plates" },
    { id: "sauerkraut", name: "Alkmaarian sauerkraut", note: "Neder’s take on a local sauerkraut dish", photo: "/interfaces/food/neder-sauerkraut-v1.jpg", price: 21, cat: "Seasonal plates" },
    { id: "pudding", name: "Black koji sticky pudding", note: "A sticky pudding made with black koji", photo: "/interfaces/food/neder-pudding-v1.jpg", price: 17, cat: "Dessert" },
  ],
  "la-dune": [
    { id: "sourdough", name: "Sourdough loaf", note: "Example bakery selection; sample item and price", photo: "/interfaces/food/la-dune-sourdough-v1.jpg", price: 7.50, cat: "Sample bakery menu" },
    { id: "croissant", name: "Butter croissant", note: "Example patisserie selection; sample item and price", photo: "/interfaces/food/la-dune-croissant-v1.jpg", price: 3.80, cat: "Sample bakery menu" },
    { id: "tart", name: "Seasonal fruit tart", note: "Example patisserie selection; sample item and price", photo: "/interfaces/food/la-dune-tart-v1.jpg", price: 6.50, cat: "Sample bakery menu" },
  ],
  jackys: [
    { id: "oklahoma", name: "Oklahoma Smash", note: "Beef, cheese, onion, onion jam, and dill pickle", photo: "/interfaces/food/jackys-oklahoma-v1.jpg", price: 13.50, cat: "Burgers" },
    { id: "classic", name: "Classic cheeseburger", note: "From Jacky Alkmaar’s published May 2026 menu", photo: "/interfaces/food/jackys-classic-v1.jpg", price: 13.50, cat: "Burgers" },
    { id: "green", name: "Green Supreme", note: "The vegan burger on the published menu", photo: "/interfaces/food/jackys-green-v1.jpg", price: 13.50, cat: "Burgers" },
    { id: "fries", name: "Fries", note: "A side from the published menu", photo: "/interfaces/food/jackys-fries-v1.jpg", price: 4.50, cat: "Sides" },
  ],
};

const money = (cents: number) => `€${(cents / 100).toFixed(2)}`;

export function Board() {
  const [view, setView] = React.useState<View>("browse");
  const [page, setPage] = React.useState<"browse" | "menu">("browse");
  const [storeId, setStoreId] = React.useState("joes-kitchen");
  const [itemId, setItemId] = React.useState("chicken");
  const [method, setMethod] = React.useState<Method>("delivery");
  const [diet, setDiet] = React.useState<Diet>("any");
  const [band, setBand] = React.useState("0");
  const [query, setQuery] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [bag, setBag] = React.useState<Line[]>([]);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);
  const [notice, setNotice] = React.useState("Real restaurants · Local ordering example");
  const board = React.useRef<HTMLElement>(null);
  const title = React.useRef<HTMLHeadingElement>(null);
  const detailTitle = React.useRef<HTMLHeadingElement>(null);
  const history = React.useRef<{ view: View; page: "browse" | "menu"; trigger: HTMLElement | null }[]>([]);
  const store = STORES.find(row => row.id === storeId)!;
  const menu = MENUS[store.id]!;
  const item = menu.find(row => row.id === itemId) ?? menu[0]!;
  const kitchens = STORES.filter(row => (diet === "any" || row.diet === diet) && (band === "0" || row.price === Number(band)) && `${row.name} ${row.area} ${row.dish}`.toLowerCase().includes(query.trim().toLowerCase()));
  const subtotal = bag.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const fees = [...new Set(bag.filter(line => line.method === "delivery").map(line => line.storeId))].reduce((sum, id) => sum + STORES.find(row => row.id === id)!.fee, 0);
  const total = subtotal + fees;
  const count = bag.reduce((sum, line) => sum + line.quantity, 0);
  const existing = bag.find(line => line.key === `${store.id}-${item.id}-${method}`)?.quantity ?? 0;
  const maxAdd = 9 - existing;

  function move(next: View) {
    if (next === view) return;
    history.current.push({ view, page, trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null });
    setView(next);
    if (next === "browse" || next === "menu") setPage(next);
    requestAnimationFrame(() => (next === "item" || next === "bag" || next === "receipt" ? detailTitle : title).current?.focus({ preventScroll: true }));
  }
  function back() {
    const previous = history.current.pop();
    setView(previous?.view ?? "browse"); setPage(previous?.page ?? "browse");
    requestAnimationFrame(() => {
      if (previous?.trigger?.isConnected && previous.trigger.getClientRects().length) previous.trigger.focus();
      else {
        const key = previous?.trigger?.dataset.foFocus;
        const target = key ? [...(board.current?.querySelectorAll<HTMLButtonElement>("[data-fo-focus]") ?? [])].find(element => element.dataset.foFocus === key && element.getClientRects().length) : null;
        (target ?? title.current)?.focus();
      }
    });
  }
  function browse() { setView("browse"); setPage("browse"); history.current = []; requestAnimationFrame(() => title.current?.focus({ preventScroll: true })); }
  function openStore(id: string) { setStoreId(id); move("menu"); }
  function openItem(id: string) { setItemId(id); setQuantity(1); move("item"); }
  function add(row: Item, amount = 1) {
    const key = `${store.id}-${row.id}-${method}`;
    const current = bag.find(line => line.key === key)?.quantity ?? 0;
    const increase = Math.min(amount, 9 - current);
    if (increase < 1) return;
    setBag(lines => current ? lines.map(line => line.key === key ? { ...line, quantity: line.quantity + increase } : line) : [...lines, { key, storeId: store.id, itemId: row.id, name: row.name, price: Math.round(row.price * 100), quantity: increase, method }]);
    setAcknowledged(false); setReceipt(null); setNotice(`${increase} × ${row.name} added to your local bag`);
    if (view === "item") setView("bag");
    else move("bag");
    requestAnimationFrame(() => detailTitle.current?.focus({ preventScroll: true }));
  }
  function changeQuantity(key: string, next: number) {
    setBag(lines => lines.map(line => line.key === key ? { ...line, quantity: Math.max(1, Math.min(9, next)) } : line));
    setAcknowledged(false); setNotice("Local bag quantity updated");
  }
  function remove(key: string) { setBag(lines => lines.filter(line => line.key !== key)); setAcknowledged(false); setNotice("Item removed from your local bag"); }
  function checkout() {
    if (!count || !acknowledged) return;
    setReceipt({ lines: bag.map(line => ({ ...line })), subtotal, fees, total });
    setBag([]); setAcknowledged(false); setView("receipt"); history.current = [];
    setNotice("Local checkout demonstration complete. No order was placed.");
    requestAnimationFrame(() => detailTitle.current?.focus({ preventScroll: true }));
  }
  function reset() { setBag([]); setReceipt(null); setAcknowledged(false); setQuery(""); setDiet("any"); setBand("0"); setMethod("delivery"); browse(); setNotice("A fresh local bag is ready"); }
  function clearFilters() { setQuery(""); setDiet("any"); setBand("0"); }

  return <section ref={board} className="fo" data-view={view} data-page={page} aria-label="Neighbourhood food workspace">
    <header className="fo-header"><div className="fo-context"><span className="fo-mark"><Icon name="bag" size={24} /></span><div><strong>Langestraat 12</strong><span>Alkmaar · Sample address</span></div></div><Button variant="ghost" className="fo-bag-button" aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`} data-fo-focus="bag" onClick={() => move("bag")}><Icon name="bag" /><span>Bag</span><span className="fo-count">{count}</span></Button></header>
    <div className="fo-body">
      <section className="fo-main" aria-label={page === "browse" ? "Browse kitchens" : `${store.name} menu`}>
        <header className="fo-page-header"><div>{page === "menu" && view !== "filters" ? <Button variant="ghost" className="fo-menu-back" onClick={browse}><Icon name="arrow-left" />Kitchens</Button> : <span className="fo-eyebrow">Made in the neighbourhood</span>}<h2 ref={title} tabIndex={-1}>{view === "filters" ? "Find your dinner" : page === "browse" ? "Something good, nearby" : store.name}</h2>{page === "menu" && <p>{store.area} · {method === "pickup" ? "Demo pickup" : "Demo delivery"} · Sample timing {store.eta}</p>}</div>{page === "browse" && <Button variant="ghost" className="fo-filter-trigger" onClick={() => move("filters")}><Icon name="sliders" />Filters</Button>}</header>
        {page === "browse" && <div className="fo-filters"><div className="fo-search"><Icon name="search" /><Input type="search" aria-label="Search kitchens" placeholder="Kitchen, dish, or neighbourhood" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="fo-filter-fields"><div><span className="fo-field-label">Demo collection</span><ToggleGroup aria-label="Method" value={method} options={[{ value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }]} onValueChange={value => setMethod(value as Method)} /></div><div><span className="fo-field-label">Kitchen type</span><Select fullWidth aria-label="Kitchen type" value={diet} options={[{ value: "any", label: "All kitchens" }, { value: "grill", label: "Caribbean grill" }, { value: "seasonal", label: "Seasonal cooking" }, { value: "bakery", label: "Bakery" }, { value: "burgers", label: "Burgers" }]} onValueChange={value => setDiet(value as Diet)} /></div><div><span className="fo-field-label">Price range</span><Select fullWidth aria-label="Price range" value={band} options={[{ value: "0", label: "Any price" }, { value: "1", label: "€ · Everyday" }, { value: "2", label: "€€ · A little more" }]} onValueChange={setBand} /></div></div><div className="fo-filter-summary"><span>{kitchens.length} {kitchens.length === 1 ? "kitchen matches" : "kitchens match"}</span><Button variant="ghost" onClick={clearFilters}>Clear filters</Button></div></div>}
        <div className="fo-main-scroll">{page === "browse" ? <div className="fo-kitchens">{kitchens.length ? kitchens.map(row => <Card className="fo-kitchen" key={row.id}><Button variant="ghost" className="fo-kitchen-open" data-fo-focus={`kitchen-${row.id}`} aria-label={`Open ${row.name} menu`} onClick={() => openStore(row.id)}><img src={row.photo} alt="" loading="lazy" /><span className="fo-kitchen-copy"><span className="fo-kitchen-title"><strong>{row.name}</strong><Icon name="arrow-right" size={16} /></span><span className="fo-kitchen-dish">{row.dish}</span><span className="fo-kitchen-meta">{row.area} · Sample {row.eta}<span>{method === "pickup" ? "Demo pickup · No sample fee" : `Sample delivery fee ${money(row.fee)}`}</span></span></span></Button></Card>) : <div className="fo-empty"><Icon name="search" size={24} /><h3>No kitchens in this view</h3><p>Try a different search, price range, or kitchen type.</p><Button variant="ghost" onClick={clearFilters}>Clear filters</Button></div>}</div> : <div className="fo-menu"><figure className="fo-menu-photo"><img src={store.photo} alt={`Illustrative food for ${store.name}`} /><figcaption>{store.dish} · Illustrative image</figcaption></figure><div className="fo-menu-heading"><span className="fo-eyebrow">From the kitchen</span><h3>{store.samplePrices ? "Sample bakery menu" : "From the published menu"}</h3><p>{store.samplePrices ? "These example bakery items use sample prices, not a verified La Dune price list." : "Selected dishes and prices from the restaurant’s published menu snapshot. Availability and current prices are not connected."} Collection methods, timing, and fees are local examples. Each dish photograph is generated for this example; actual presentation may differ.</p></div>{menu.map(row => { const inBag = bag.find(line => line.key === `${store.id}-${row.id}-${method}`)?.quantity ?? 0; return <article className="fo-menu-item" key={row.id}><Button variant="ghost" className="fo-item-open" data-fo-focus={`item-${row.id}`} aria-label={`View ${row.name}`} onClick={() => openItem(row.id)}><img src={row.photo} alt="" /><span><strong>{row.name}</strong><span>{row.note}</span><b>{money(row.price * 100)}{store.samplePrices ? " · Sample price" : ""}</b></span></Button><Button variant="ghost" className="fo-quick-add" aria-label={`Add ${row.name} to bag`} disabled={inBag >= 9} data-fo-focus={`add-${row.id}`} onClick={() => add(row)}><Icon name="plus" /></Button></article>; })}<section className="fo-restaurant-info" aria-label={`About ${store.name}`}><span className="fo-eyebrow">Know the kitchen</span><h3>About {store.name}</h3><p>{store.about}</p><address>{store.address}</address><div><a href={store.website} target="_blank" rel="noreferrer">Official website<Icon name="arrow-right" size={16} /></a>{!store.samplePrices && <a href={store.menuSource} target="_blank" rel="noreferrer">Published menu<Icon name="file-text" size={16} /></a>}</div><p className="fo-small">{store.samplePrices ? "Restaurant details are from its official website. Menu items and prices above are examples." : "Restaurant details and menu prices are from the linked official sources."}</p></section></div>}</div>
        <div className="fo-filter-action"><Button onClick={() => { setView("browse"); history.current.pop(); requestAnimationFrame(() => title.current?.focus({ preventScroll: true })); }}>Show {kitchens.length} {kitchens.length === 1 ? "kitchen" : "kitchens"}<Icon name="arrow-right" /></Button></div>
      </section>
      <aside className="fo-side" aria-label={view === "item" ? "Dish details" : view === "receipt" ? "Local receipt" : "Your bag"}>
        <header className="fo-side-header">{(view === "item" || view === "bag") && <Button variant="ghost" className="fo-back" onClick={back}><Icon name="arrow-left" />Back</Button>}<div><span className="fo-eyebrow">{view === "receipt" ? "All done, locally" : view === "item" ? store.name : "A little of what you love"}</span><h2 ref={detailTitle} tabIndex={-1}>{view === "item" ? "A closer look" : view === "receipt" ? "Demo complete" : "Your bag"}</h2></div></header>
        {view === "item" ? <><div className="fo-dish"><img src={item.photo} alt={`Illustrative ${item.name}`} /><div><span className="fo-eyebrow">{item.cat}</span><h3>{item.name}</h3><p>{item.note}</p><strong>{money(item.price * 100)}{store.samplePrices ? " · Sample price" : ""}</strong></div><NumberField label="Quantity" value={quantity} min={1} max={Math.max(1, maxAdd)} step={1} disabled={maxAdd === 0} controlsPlacement="inline" decrementLabel="Decrease quantity" incrementLabel="Increase quantity" onValueChange={value => setQuantity(Math.max(1, Math.min(Math.max(1, maxAdd), value ?? 1)))} /><p className="fo-small">{maxAdd ? `Up to ${maxAdd} more in this local bag.` : "This bag already has 9 of this dish."}</p><p className="fo-small">Illustrative image. Confirm ingredients, allergens, and current availability with the restaurant; this example does not place an order.</p></div><div className="fo-side-actions"><Button disabled={!maxAdd} onClick={() => add(item, quantity)}><Icon name="plus" />Add to bag · {money(item.price * 100 * quantity)}</Button></div></> : view === "receipt" && receipt ? <><div className="fo-receipt"><span className="fo-receipt-mark"><Icon name="check" size={24} /></span><h3>Your example is complete</h3><p>No order was placed. No payment was taken.</p><div className="fo-receipt-lines">{receipt.lines.map(line => <div key={line.key}><span>{line.quantity} × {line.name}</span><strong>{money(line.price * line.quantity)}</strong></div>)}</div><div className="fo-totals"><div><span>Food</span><span>{money(receipt.subtotal)}</span></div><div><span>Sample delivery fees</span><span>{money(receipt.fees)}</span></div><div className="fo-total"><strong>Demo total</strong><strong>{money(receipt.total)}</strong></div></div><p className="fo-small">This receipt exists only in this browser tab.</p></div><div className="fo-side-actions"><Button onClick={reset}>Start new bag<Icon name="arrow-right" /></Button></div></> : <><div className="fo-bag-scroll">{bag.length ? <><div className="fo-bag-lines">{bag.map(line => <article className="fo-bag-line" key={line.key} data-line={line.key}><div className="fo-line-heading"><div><span className="fo-eyebrow">{STORES.find(row => row.id === line.storeId)!.name} · Demo {line.method}</span><h3>{line.name}</h3></div><strong>{money(line.price * line.quantity)}</strong></div><div className="fo-line-controls"><div role="group" aria-label={`${line.name} quantity`}><Button variant="ghost" aria-label={`Decrease ${line.name} quantity`} disabled={line.quantity === 1} onClick={() => changeQuantity(line.key, line.quantity - 1)}><Icon name="minus" /></Button><span className="fo-line-quantity">{line.quantity}</span><Button variant="ghost" aria-label={`Increase ${line.name} quantity`} disabled={line.quantity === 9} onClick={() => changeQuantity(line.key, line.quantity + 1)}><Icon name="plus" /></Button></div><Button variant="ghost" aria-label={`Remove ${line.name} from bag`} onClick={() => remove(line.key)}><Icon name="trash" /></Button></div></article>)}</div><div className="fo-totals"><div><span>Food</span><span>{money(subtotal)}</span></div><div><span>Sample delivery fees</span><span>{money(fees)}</span></div><div className="fo-total"><strong>Total</strong><strong>{money(total)}</strong></div></div><p className="fo-small">Sample delivery is counted once per kitchen with delivery items. Demo pickup has no fee.</p><div className="fo-confirm"><Checkbox checked={acknowledged} onCheckedChange={setAcknowledged} label="I understand this is a local demo." /></div></> : <div className="fo-empty-bag"><Icon name="bag" size={24} /><h3>Make room for something good</h3><p>Your bag is empty. Explore a kitchen and add a dish to begin.</p><span className="fo-small">A local example, from first choice to receipt.</span></div>}</div><div className="fo-side-actions"><Button disabled={!count || !acknowledged} onClick={checkout}>Complete demo checkout<Icon name="arrow-right" /></Button><span className="fo-small">No order or payment will be submitted</span></div></>}
      </aside>
    </div>
    <nav className="fo-mobile-nav" aria-label="Food sections"><Button variant="ghost" aria-pressed={view === "browse" || view === "menu"} onClick={browse}><Icon name="home" />Browse</Button><Button variant="ghost" aria-pressed={view === "bag"} onClick={() => move("bag")}><Icon name="bag" />Bag · {count}</Button></nav>
    <footer className="fo-footer"><span role="status">{notice}</span><span>Local example</span></footer>
  </section>;
}
