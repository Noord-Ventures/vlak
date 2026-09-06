"use client";

import * as React from "react";
import { Icon, Input, InputGroup, ToggleGroup } from "@noorddev/vlak-react";
import { Brand } from "../mark";
import { MobileFood } from "./mobile";
import { interfaceBySlug } from "../catalog";
import { InspectorClose } from "../inspector-close";

const WHAT = interfaceBySlug("evening")!.what;

export type Method = "delivery" | "pickup";
export type Diet = "any" | "veg" | "fish";
export type Inspect = { kind: "item"; id: string } | { kind: "bag" } | null;

export type Store = {
  id: string;
  name: string;
  area: string;
  photo: string;
  rating: string;
  fee: string;
  eta: string;
  method: Method;
  diet: Diet;
  price: 1 | 2;
  dish: string;
};

export type Item = {
  id: string;
  name: string;
  note: string;
  photo: string;
  price: number;
  cat: string;
};

export type Line = { key: string; id: string; store: string; name: string; price: number };

const STORES: Store[] = [
  { id: "buren", name: "De Buren", area: "Alkmaar", photo: "/interfaces/food/de-buren-v2.jpg", rating: "4.8", fee: "€2.40", eta: "22 min", method: "delivery", diet: "any", price: 2, dish: "Roast chicken, tonight" },
  { id: "kaas", name: "Kaasbar", area: "Kaasmarkt", photo: "/interfaces/food/kaasbar.webp", rating: "4.6", fee: "€1.80", eta: "18 min", method: "pickup", diet: "veg", price: 2, dish: "Aged cheese board" },
  { id: "canal", name: "Canal kitchen", area: "Oudegracht", photo: "/interfaces/food/canal-v2.jpg", rating: "4.7", fee: "€2.90", eta: "27 min", method: "delivery", diet: "fish", price: 2, dish: "Saffron fish stew" },
  { id: "lunch", name: "Press lunch", area: "Spoor", photo: "/interfaces/food/lunch.webp", rating: "4.5", fee: "€1.40", eta: "14 min", method: "pickup", diet: "veg", price: 1, dish: "Ricotta toast" },
  { id: "north", name: "North bakery", area: "Kennemerstraatweg", photo: "/interfaces/food/north.webp", rating: "4.9", fee: "€1.20", eta: "16 min", method: "delivery", diet: "veg", price: 1, dish: "Morning loaf" },
  { id: "folsom", name: "Station bakery", area: "Stationsweg", photo: "/interfaces/food/bakery.webp", rating: "4.4", fee: "€2.10", eta: "24 min", method: "delivery", diet: "any", price: 1, dish: "Almond pastry" },
];

const MENUS: Record<string, Item[]> = {
  buren: [
    { id: "chicken", name: "Roast chicken", note: "With potatoes and seasonal greens", photo: "/interfaces/food/de-buren-v2.jpg", price: 18, cat: "Plates" },
    { id: "salad", name: "Beet salad", note: "Roasted beetroot and goat’s cheese", photo: "/interfaces/food/dish-salad.webp", price: 9, cat: "Plates" },
    { id: "soup", name: "Leek soup", note: "With sourdough bread", photo: "/interfaces/food/dish-soup.webp", price: 8, cat: "Soup" },
  ],
  kaas: [
    { id: "board", name: "Cheese board", note: "Ready", photo: "/interfaces/food/kaasbar.webp", price: 16, cat: "Boards" },
    { id: "rye", name: "Rye and honey", note: "Last loaf", photo: "/interfaces/food/dish-pastry.webp", price: 7, cat: "Bread" },
  ],
  canal: [
    { id: "stew", name: "Fish stew", note: "On the fire", photo: "/interfaces/food/canal-v2.jpg", price: 21, cat: "Plates" },
    { id: "greens", name: "Green salad", note: "Cold plate", photo: "/interfaces/food/dish-salad.webp", price: 8, cat: "Plates" },
  ],
  lunch: [
    { id: "toast", name: "Ricotta toast", note: "Ready", photo: "/interfaces/food/lunch.webp", price: 9, cat: "Toast" },
    { id: "pastry", name: "Almond pastry", note: "Evening only", photo: "/interfaces/food/dish-pastry.webp", price: 5, cat: "Sweet" },
  ],
  north: [
    { id: "loaf", name: "Morning loaf", note: "Still warm", photo: "/interfaces/food/north.webp", price: 6, cat: "Bread" },
    { id: "bun", name: "Butter bun", note: "Two left", photo: "/interfaces/food/bakery.webp", price: 4, cat: "Bread" },
  ],
  folsom: [
    { id: "tart", name: "Almond pastry", note: "Evening only", photo: "/interfaces/food/dish-pastry.webp", price: 5, cat: "Sweet" },
    { id: "soup2", name: "Leek soup", note: "Cup", photo: "/interfaces/food/dish-soup.webp", price: 7, cat: "Soup" },
  ],
};

function money(n: number) {
  return `€${n.toFixed(2)}`;
}

export function Board() {
  const [page, setPage] = React.useState<"market" | "store">("market");
  const [storeId, setStoreId] = React.useState("buren");
  const [method, setMethod] = React.useState<Method>("delivery");
  const [diet, setDiet] = React.useState<Diet>("any");
  const [band, setBand] = React.useState<0 | 1 | 2>(0);
  const [query, setQuery] = React.useState("");
  const [inspect, setInspect] = React.useState<Inspect>(null);
  const [bag, setBag] = React.useState<Line[]>([]);
  const store = STORES.find((row) => row.id === storeId) ?? STORES[0]!;
  const menu = MENUS[store.id] ?? MENUS.buren!;
  const item = inspect?.kind === "item" ? menu.find((row) => row.id === inspect.id) ?? menu[0]! : null;
  const rooms = STORES.filter((row) => {
    if (row.method !== method) return false;
    if (diet !== "any" && row.diet !== diet && row.diet !== "any") return false;
    if (band !== 0 && row.price !== band) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${row.name} ${row.area} ${row.dish}`.toLowerCase().includes(q);
  });
  const cats = [...new Set(menu.map((row) => row.cat))];
  const count = bag.length;
  const total = bag.reduce((sum, line) => sum + line.price, 0);

  function openStore(id: string) {
    setStoreId(id);
    setPage("store");
    setInspect(null);
  }

  function addItem(row: Item, openBag = true) {
    setBag((lines) => [
      ...lines,
      { key: `${row.id}-${Date.now()}`, id: row.id, store: store.name, name: row.name, price: row.price },
    ]);
    setInspect(openBag ? { kind: "bag" } : null);
  }

  return (
    <section className="if-board sc-evening" data-page={page} aria-label={`${WHAT} application`}>
      <section className="sc-evening-stage">
        <header className="sc-evening-bar">
          <Brand slug="evening" />
          <p className="sc-evening-addr if-ico-row">
            <Icon name="map-pin" size={12} />
            Langestraat 12
          </p>
          <InputGroup className="sc-evening-search">
            <span className="sc-evening-search-mark" aria-hidden="true"><Icon name="search" size={16} /></span>
            <Input
              type="search"
              value={query}
              placeholder="Search kitchens"
              aria-label="Search kitchens"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage("market");
              }}
            />
          </InputGroup>
          <button
            type="button"
            className="sc-evening-bag"
            aria-pressed={inspect?.kind === "bag"}
            onClick={() => setInspect((cur) => (cur?.kind === "bag" ? null : { kind: "bag" }))}
          >
            <Icon name="bag" size={16} />
            Bag{count ? ` ${count}` : ""}
          </button>
        </header>

        {page === "market" ? (
          <>
            <div className="sc-evening-filters">
              <ToggleGroup
                className="sc-evening-seg"
                aria-label="Method"
                value={method}
                options={[
                  { value: "delivery", label: <><Icon name="truck" size={12} />Delivery</> },
                  { value: "pickup", label: <><Icon name="package" size={12} />Pickup</> },
                ]}
                onValueChange={(value) => setMethod(value as Method)}
              />
              <ToggleGroup
                className="sc-evening-seg"
                aria-label="Diet"
                value={diet}
                options={[
                  { value: "any", label: <><Icon name="layers" size={12} />Any</> },
                  { value: "veg", label: <><Icon name="tag" size={12} />Veg</> },
                  { value: "fish", label: <><Icon name="flag" size={12} />Fish</> },
                ]}
                onValueChange={(value) => setDiet(value as Diet)}
              />
              <ToggleGroup
                className="sc-evening-seg"
                aria-label="Price"
                value={String(band)}
                options={[
                  { value: "0", label: "Any price" },
                  { value: "1", label: "€" },
                  { value: "2", label: "€€" },
                ]}
                onValueChange={(value) => setBand(Number(value) as 0 | 1 | 2)}
              />
            </div>
            <div className="sc-evening-stores" role="group" aria-label="Kitchens">
              {rooms.length === 0 ? (
                <p className="sc-evening-empty">No kitchens match. Try another search or change the filters.</p>
              ) : (
                rooms.map((row) => (
                  <button key={row.id} type="button" className="sc-evening-store" onClick={() => openStore(row.id)}>
                    <img src={row.photo} alt="" loading="lazy" decoding="async" />
                    <span>
                      <b>{row.name}</b>
                      <i className="if-ico-row">
                        <Icon name="star" size={12} />
                        {row.rating}
                        <Icon name="clock" size={12} />
                        {row.eta}
                      </i>
                      <em className="if-ico-row">
                        <Icon name="map-pin" size={12} />
                        {row.area} · {row.method === "pickup" ? "Free pickup" : `${row.fee} delivery`}
                      </em>
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="sc-evening-menu" role="group" aria-label="Menu">
            <header className="sc-evening-head">
              <button type="button" className="sc-evening-back" onClick={() => setPage("market")}>
                <Icon name="arrow-left" size={12} />
                Stores
              </button>
              <p className="if-ico-row">
                <Icon name="home" size={16} />
                {store.name}
              </p>
              <span className="if-ico-row">
                <Icon name="star" size={12} />
                {store.rating}
                <Icon name="clock" size={12} />
                {store.eta}
              </span>
            </header>
            <div className="sc-evening-hero">
              <img src={store.photo} alt="" loading="lazy" decoding="async" />
              <p>{store.dish}</p>
            </div>
            {cats.map((cat) => (
              <section key={cat} className="sc-evening-cat">
                <h2>{cat}</h2>
                {menu
                  .filter((row) => row.cat === cat)
                  .map((row) => (
                    <div key={row.id} className="sc-evening-item">
                      <button
                        type="button"
                        className="sc-evening-item-open"
                        onClick={() => setInspect({ kind: "item", id: row.id })}
                      >
                        <img src={row.photo} alt="" loading="lazy" decoding="async" />
                        <span>
                          <b>{row.name}</b>
                          <i className="if-ico-row">
                            <Icon name="tag" size={12} />
                            {row.note}
                          </i>
                        </span>
                        <em className="if-ico-row">
                          <Icon name="dollar" size={12} />
                          {money(row.price)}
                        </em>
                      </button>
                      <button type="button" className="sc-evening-add" onClick={() => addItem(row)}>
                        <Icon name="plus" size={12} />
                        Add
                      </button>
                    </div>
                  ))}
              </section>
            ))}
          </div>
        )}
      </section>

      <nav className="if-thumb" aria-label={WHAT}>
        <button
          type="button"
          aria-current={page === "market" && inspect?.kind !== "bag"}
          onClick={() => {
            setPage("market");
            setInspect(null);
          }}
        >
          <Icon name="home" size={16} />
          Stores
        </button>
        <button
          type="button"
          aria-pressed={inspect?.kind === "bag"}
          onClick={() => setInspect((cur) => (cur?.kind === "bag" ? null : { kind: "bag" }))}
        >
          <Icon name="bag" size={16} />
          Bag{count ? ` ${count}` : ""}
        </button>
      </nav>

      <aside className={`if-inspect${inspect ? " is-open" : ""}`} aria-label={inspect?.kind === "bag" ? "Bag" : "Plate"}>
        {inspect ? <InspectorClose onClick={() => setInspect(null)} /> : null}
        {inspect?.kind === "bag" ? (
          <div key={`bag-${count}`} className="sc-evening-sheet sc-fresh">
            <p className="sc-evening-label if-ico-row">
              <Icon name="bag" size={12} />
              Bag
            </p>
            {bag.length === 0 ? (
              <p>The bag is empty.</p>
            ) : (
              <>
                {bag.map((line) => (
                  <div key={line.key} className="sc-evening-line">
                    <span className="if-ico-row">
                      <Icon name="package" size={16} />
                      <span>
                        <b>{line.name}</b>
                        <i>{line.store}</i>
                      </span>
                    </span>
                    <em>{money(line.price)}</em>
                  </div>
                ))}
                <p className="sc-evening-total if-ico-row">
                  <span className="if-ico-row">
                    <Icon name="wallet" size={12} />
                    Total
                  </span>
                  <strong>{money(total)}</strong>
                </p>
              </>
            )}
          </div>
        ) : item ? (
          <div key={item.id} className="sc-evening-sheet sc-fresh">
            <p className="sc-evening-label if-ico-row">
              <Icon name="image" size={12} />
              Plate
            </p>
            <img src={item.photo} alt="" loading="lazy" decoding="async" />
            <p className="sc-evening-dish">{item.name}</p>
            <p>
              {item.note}. {money(item.price)}.
            </p>
            <button type="button" className="sc-evening-ghost" onClick={() => addItem(item)}>
              <Icon name="plus" size={12} />
              Add to bag
            </button>
          </div>
        ) : null}
      </aside>
      <MobileFood page={page} setPage={setPage} store={store} menu={menu} rooms={rooms} method={method} setMethod={setMethod} diet={diet} setDiet={setDiet} band={band} setBand={setBand} query={query} setQuery={setQuery} inspect={inspect} setInspect={setInspect} bag={bag} setBag={setBag} openStore={openStore} addItem={(row) => addItem(row, false)} />
    </section>
  );
}
