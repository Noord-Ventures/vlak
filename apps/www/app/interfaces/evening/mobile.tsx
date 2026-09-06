"use client";

import * as React from "react";
import { Button, Card, Icon, Input, InputGroup, ToggleGroup } from "@noorddev/vlak-react";
import type { Diet, Inspect, Item, Line, Method, Store } from "./board";

type Props = {
  page: "market" | "store";
  setPage: (page: "market" | "store") => void;
  store: Store;
  menu: Item[];
  rooms: Store[];
  method: Method;
  setMethod: (value: Method) => void;
  diet: Diet;
  setDiet: (value: Diet) => void;
  band: 0 | 1 | 2;
  setBand: (value: 0 | 1 | 2) => void;
  query: string;
  setQuery: (value: string) => void;
  inspect: Inspect;
  setInspect: (value: Inspect) => void;
  bag: Line[];
  setBag: React.Dispatch<React.SetStateAction<Line[]>>;
  openStore: (id: string) => void;
  addItem: (item: Item) => void;
};

const money = (value: number) => `€${value.toFixed(2)}`;

export function MobileFood({ page, setPage, store, menu, rooms, method, setMethod, diet, setDiet, band, setBand, query, setQuery, inspect, setInspect, bag, setBag, openStore, addItem }: Props) {
  const [filters, setFilters] = React.useState(false);
  const [ordered, setOrdered] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const heading = React.useRef<HTMLHeadingElement>(null);
  const scroll = React.useRef<HTMLDivElement>(null);
  const storeButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const dishButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const filterTrigger = React.useRef<HTMLButtonElement | null>(null);
  const bagTrigger = React.useRef<HTMLButtonElement | null>(null);
  const item = inspect?.kind === "item" ? menu.find((dish) => dish.id === inspect.id) : undefined;
  const screen = ordered ? "confirmation" : filters ? "filters" : inspect?.kind === "bag" ? "bag" : item ? "dish" : page;
  const total = bag.reduce((sum, line) => sum + line.price, 0);
  const categories = [...new Set(menu.map((dish) => dish.cat))];
  function focusHeading() { requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); if (scroll.current) scroll.current.scrollTop = 0; }); }
  function back() {
    if (filters) { setFilters(false); requestAnimationFrame(() => filterTrigger.current?.focus({ preventScroll: true })); }
    else if (inspect) { setInspect(null); requestAnimationFrame(() => (item ? dishButtons.current.get(item.id) : bagTrigger.current)?.focus({ preventScroll: true })); }
    else { setPage("market"); requestAnimationFrame(() => storeButtons.current.get(store.id)?.focus({ preventScroll: true })); }
  }
  function showBag(trigger: HTMLButtonElement) { bagTrigger.current = trigger; setInspect({ kind: "bag" }); focusHeading(); }
  function browse() { setOrdered(false); setFilters(false); setInspect(null); setPage("market"); focusHeading(); }
  const pageTitle = screen === "filters" ? "Filters" : screen === "bag" ? "Your bag" : screen === "dish" ? "Dish details" : screen === "confirmation" ? "Order received" : store.name;

  return <section className="sc-food-mobile" data-screen={screen} aria-label="Mobile food ordering">
    <header className="sc-food-mobile-header">{screen === "market" ? <><div><span>{method === "delivery" ? "Deliver to" : "Pickup near"}</span><h2 ref={heading} tabIndex={-1}>Langestraat 12</h2></div><Button variant="ghost" aria-label="Open food filters" ref={filterTrigger} onClick={() => { setFilters(true); focusHeading(); }}><Icon name="sliders" size={16} /></Button></> : <><Button variant="ghost" onClick={screen === "confirmation" ? browse : back}><Icon name="arrow-left" size={16} /><span>{screen === "dish" ? "Menu" : "Back"}</span></Button><h2 ref={heading} tabIndex={-1}>{pageTitle}</h2></>}</header>
    <div ref={scroll} className="sc-food-mobile-scroll">
      {screen === "market" ? <>
        <div className="sc-food-mobile-search"><InputGroup><span aria-hidden="true"><Icon name="search" size={16} /></span><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a kitchen or dish" aria-label="Find a kitchen or dish" /></InputGroup><ToggleGroup aria-label="Order method" value={method} onValueChange={(value) => setMethod(value as Method)} options={[{ value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }]} /></div>
        <div className="sc-food-mobile-section"><h3>Kitchens near you</h3><span>{rooms.length} open</span></div>
        <div className="sc-food-mobile-stores">{rooms.map((kitchen) => <Card key={kitchen.id} className="sc-food-mobile-store"><button ref={(element) => { if (element) storeButtons.current.set(kitchen.id, element); else storeButtons.current.delete(kitchen.id); }} type="button" onClick={() => { openStore(kitchen.id); focusHeading(); }}><img src={kitchen.photo} alt="" loading="lazy" /><span><strong>{kitchen.name}</strong><span><Icon name="star" size={16} />{kitchen.rating}<span>·</span>{kitchen.eta}</span><small>{kitchen.area} · {method === "pickup" ? "Free pickup" : `${kitchen.fee} delivery`}</small></span></button></Card>)}{rooms.length === 0 ? <div className="sc-food-mobile-empty"><Icon name="search" size={24} /><h3>No kitchens found</h3><p>Try another dish or loosen your filters.</p><Button variant="ghost" onClick={() => { setDiet("any"); setBand(0); setQuery(""); }}>Clear filters</Button></div> : null}</div>
      </> : screen === "filters" ? <div className="sc-food-mobile-filters"><p>Choose how you want to order. Your results update as you go.</p><section><h3>Order method</h3><ToggleGroup aria-label="Filter order method" value={method} onValueChange={(value) => setMethod(value as Method)} options={[{ value: "delivery", label: "Delivery" }, { value: "pickup", label: "Pickup" }]} /></section><section><h3>Food preferences</h3><ToggleGroup aria-label="Food preferences" value={diet} onValueChange={(value) => setDiet(value as Diet)} options={[{ value: "any", label: "Any" }, { value: "veg", label: "Vegetarian" }, { value: "fish", label: "Fish" }]} /></section><section><h3>Price range</h3><ToggleGroup aria-label="Food price range" value={String(band)} onValueChange={(value) => setBand(Number(value) as 0 | 1 | 2)} options={[{ value: "0", label: "Any price" }, { value: "1", label: "€" }, { value: "2", label: "€€" }]} /></section><Button variant="ghost" onClick={() => { setDiet("any"); setBand(0); }}>Reset preferences</Button></div> : screen === "store" ? <>
        <img className="sc-food-mobile-hero" src={store.photo} alt="" /><div className="sc-food-mobile-store-intro"><h3>{store.dish}</h3><p><Icon name="star" size={16} />{store.rating}<span>·</span>{store.eta}<span>·</span>{method === "pickup" ? "Free pickup" : `${store.fee} delivery`}</p></div>
        {categories.map((category) => <section className="sc-food-mobile-category" key={category}><h3>{category}</h3>{menu.filter((dish) => dish.cat === category).map((dish) => <button ref={(element) => { if (element) dishButtons.current.set(dish.id, element); else dishButtons.current.delete(dish.id); }} className="sc-food-mobile-dish-row" key={dish.id} type="button" onClick={() => { setInspect({ kind: "item", id: dish.id }); focusHeading(); }}><span><strong>{dish.name}</strong><span>{dish.note}</span><b>{money(dish.price)}</b></span><img src={dish.photo} alt="" loading="lazy" /></button>)}</section>)}
      </> : screen === "dish" && item ? <><img className="sc-food-mobile-dish-photo" src={item.photo} alt="" /><div className="sc-food-mobile-dish-detail"><p>{store.name}</p><h3>{item.name}</h3><p>{item.note}.</p><strong>{money(item.price)}</strong><div className="sc-food-mobile-dish-note"><Icon name="info" size={16} /><p>Prepared to order. Ask the kitchen about ingredients and allergens before ordering.</p></div></div></> : screen === "bag" ? <div className="sc-food-mobile-bag"><p className="sc-food-mobile-bag-caption">{bag.length} {bag.length === 1 ? "item" : "items"} in your bag</p>{bag.length ? <>{bag.map((line) => <Card key={line.key} className="sc-food-mobile-bag-line"><div><h3>{line.name}</h3><p>{line.store}</p><strong>{money(line.price)}</strong></div><Button variant="ghost" aria-label={`Remove ${line.name}`} onClick={() => { setBag((lines) => lines.filter((row) => row.key !== line.key)); setAnnouncement(`${line.name} removed from your bag.`); }}><Icon name="minus" size={16} /></Button></Card>)}<dl><div><dt>Item total</dt><dd>{money(total)}</dd></div><div><dt>Payment</dt><dd>Demo only</dd></div></dl><p className="sc-food-mobile-order-note">This is a local example. No order is sent and no payment is taken.</p></> : <div className="sc-food-mobile-empty"><Icon name="bag" size={24} /><h3>Something good is nearby</h3><p>Choose a kitchen and add a dish to get started.</p><Button variant="ghost" onClick={browse}>Browse kitchens</Button></div>}</div> : screen === "confirmation" ? <div className="sc-food-mobile-confirmation"><span><Icon name="check" size={24} /></span><h3>Your demo order is ready</h3><p>You have completed the ordering flow. Nothing was sent to a kitchen or charged.</p></div> : null}
    </div>
    <footer className="sc-food-mobile-dock">
      {screen === "filters" ? <Button onClick={() => { setFilters(false); focusHeading(); }}>Show {rooms.length} kitchens<Icon name="arrow-right" size={16} /></Button> : screen === "dish" && item ? <Button onClick={() => { addItem(item); setAnnouncement(`${item.name} added to your bag.`); requestAnimationFrame(() => dishButtons.current.get(item.id)?.focus({ preventScroll: true })); }}><Icon name="plus" size={16} />Add to bag<span>{money(item.price)}</span></Button> : screen === "bag" && bag.length ? <Button onClick={() => { setBag([]); setInspect(null); setOrdered(true); focusHeading(); }}>Place demo order<span>{money(total)}</span></Button> : screen === "confirmation" ? <Button onClick={browse}>Keep browsing<Icon name="arrow-right" size={16} /></Button> : bag.length ? <Button onClick={(event) => showBag(event.currentTarget)}><Icon name="bag" size={16} />View bag ({bag.length})<span>{money(total)}</span></Button> : <nav aria-label="Food sections"><Button variant="ghost" aria-current={screen !== "bag" ? "page" : undefined} onClick={browse}><Icon name="home" size={16} />Browse</Button><Button variant="ghost" aria-current={screen === "bag" ? "page" : undefined} onClick={(event) => showBag(event.currentTarget)}><Icon name="bag" size={16} />Bag</Button></nav>}
    </footer>
    <span className="sc-food-mobile-announcement" role="status">{announcement}</span>
  </section>;
}
