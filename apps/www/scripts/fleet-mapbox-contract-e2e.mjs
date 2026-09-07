import assert from "node:assert/strict";

const fixtureRoute = (start, end) => ({ type: "LineString", coordinates: [start, [start[0] + .0003, end[1] + .0002], end] });

// An isolated SDK contract double, not evidence of real Mapbox tiles or WebGL.
export async function installFleetMapboxContract(page) {
  await page.route("https://api.mapbox.com/directions/v5/**", route => {
    const url = new URL(route.request().url());
    const [start, end] = url.pathname.split("/").at(-1).split(";").map(point => point.split(",").map(Number));
    assert.equal(url.searchParams.get("geometries"), "geojson");
    assert.equal(url.searchParams.get("overview"), "full");
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ code: "Ok", routes: [{ geometry: fixtureRoute(start, end), distance: 520 }] }) });
  });
  await page.route("https://api.mapbox.com/mapbox-gl-js/**", async route => {
    if (route.request().url().endsWith(".css")) return route.fulfill({ contentType: "text/css", body: ".mapboxgl-map { overflow: hidden; position: relative; } .mapboxgl-canvas { position: absolute; width: 100%; height: 100%; }" });
    await route.fulfill({ contentType: "application/javascript", body: `
      window.__fleetContract = { maps: [], calls: [] };
      window.mapboxgl = { Map: class {
        constructor(options) {
          this.options = options; this.events = {}; this.sources = {}; this.resetLayers(); this.zoom = options.zoom; this.center = options.center; this.loaded = false; this.removed = false;
          options.container.classList.add('mapboxgl-map'); this.canvas = document.createElement('canvas'); this.canvas.tabIndex = 0; this.canvas.className = 'mapboxgl-canvas'; options.container.append(this.canvas);
          window.__fleetContract.maps.push(this); this.record('construct', { ...options, container: 'host' });
          setTimeout(() => { if (!this.removed) { this.loaded = true; this.emit('style.load'); this.emit('load'); } }, 20);
        }
        record(method, value) { window.__fleetContract.calls.push({ map: window.__fleetContract.maps.indexOf(this), method, value }); }
        on(event, callback) { (this.events[event] ??= []).push(callback); }
        emit(event, eventData) { if (!this.removed) for (const callback of this.events[event] ?? []) callback(eventData); }
        project(point) { const rect = this.options.container.getBoundingClientRect(); const scale = 2 ** (this.zoom - 14.5); return { x: rect.width / 2 + (point[0] - this.center[0]) * 45000 * scale, y: rect.height / 2 - (point[1] - this.center[1]) * 45000 * scale }; }
        getCanvas() { return this.canvas; }
        getZoom() { return this.zoom; }
        resetLayers() { this.layers = [{ id: 'background', type: 'background', paint: { 'background-color': '#ffffff' } }, { id: 'water', type: 'fill', paint: { 'fill-color': '#3377cc' } }, { id: 'road-street', type: 'line', paint: { 'line-color': '#ffffff' } }, { id: 'place-label', type: 'symbol', layout: { 'text-field': 'Dogpatch', 'icon-image': 'park' }, paint: { 'text-color': '#225533' } }]; }
        getStyle() { return { layers: this.layers }; }
        easeTo(options, eventData) { if (options.zoom !== undefined && this.zoom !== options.zoom) this.emit('zoomend'); this.record('easeTo', options); if (options.center) this.center = options.center; if (options.zoom !== undefined) this.zoom = options.zoom; this.emit('move', eventData); if (options.zoom !== undefined) this.emit('zoomend', eventData); }
        setStyle(style, options) { this.record('setStyle', { style, options }); this.loaded = false; this.sources = {}; this.resetLayers(); setTimeout(() => { if (!this.removed) { this.loaded = true; this.emit(options?.diff === false ? 'style.load' : 'styledata'); } }, 20); }
        isStyleLoaded() { return this.loaded; }
        addSource(id, source) { if (this.sources[id]) throw new Error('Duplicate source: ' + id); this.record('addSource', { id, source }); this.sources[id] = { data: source.data, setData: data => { this.sources[id].data = data; this.record('setData', { id, data }); } }; }
        getSource(id) { return this.sources[id]; }
        addLayer(layer, beforeId) { if (this.layers.some(entry => entry.id === layer.id)) throw new Error('Duplicate layer: ' + layer.id); const index = this.layers.findIndex(entry => entry.id === beforeId); if (index === -1) this.layers.push(layer); else this.layers.splice(index, 0, layer); this.record('addLayer', layer); }
        setPaintProperty(id, property, value) { const layer = this.layers.find(entry => entry.id === id); (layer.paint ??= {})[property] = value; this.record('paint', { id, property, value }); }
        resize() { this.record('resize'); this.emit('move'); }
        remove() { this.record('remove'); this.removed = true; this.canvas.remove(); this.events = {}; }
      } };
    ` });
  });
}

export async function checkFleetMapboxContract({ page, base, fail }) {
  const activate = async target => { await target.press("Enter"); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); };
  try {
    await page.goto(`${base}/interfaces/night/`, { waitUntil: "networkidle" });
    const board = page.locator(".fm");
    await page.waitForFunction(() => document.querySelector(".fm-map-view")?.getAttribute("data-map-status") === "ready" && document.querySelector(".fm-map-view")?.getAttribute("data-route-status") === "ready");
    const snapshot = () => page.evaluate(() => { const contract = window.__fleetContract, map = contract.maps.at(-1); return { calls: contract.calls, options: { ...map.options, container: "host" }, sources: Object.fromEntries(Object.entries(map.sources).map(([id, source]) => [id, source.data])), layers: map.layers, zoom: map.zoom, maps: contract.maps.length, removed: contract.maps.filter(entry => entry.removed).length }; });
    let value = await snapshot();
    assert.deepEqual(value.options.center, [-122.3886, 37.7581]);
    assert.equal(value.options.zoom, 14.5);
    assert.equal(value.options.accessToken, "pk.test");
    assert.equal(value.options.attributionControl, true);
    assert.equal(value.options.cooperativeGestures, true);
    assert.deepEqual(value.sources["fleet-route"].features[0].geometry, fixtureRoute([-122.3849, 37.7603], [-122.3905, 37.7568]), "Use the provider response geometry, not the supplied display polyline");
    assert.equal(value.sources["fleet-route"].features[0].properties.profile, "driving");
    assert.equal(value.layers.filter(layer => layer.id.startsWith("fleet-")).length, 2);
    const palette = await board.evaluate(element => { const css = getComputedStyle(element); return { paper: css.getPropertyValue("--bg").trim(), ink: css.getPropertyValue("--text").trim(), fill: css.getPropertyValue("--control-fill").trim() }; });
    assert.equal(value.layers.find(layer => layer.id === "background").paint["background-color"], palette.paper);
    assert.equal(value.layers.find(layer => layer.id === "water").paint["fill-color"], palette.fill);
    assert.equal(value.layers.find(layer => layer.id === "road-street").paint["line-color"], palette.fill);
    assert.equal(value.layers.find(layer => layer.id === "place-label").paint["text-color"], palette.ink);
    assert.equal(value.layers.find(layer => layer.id === "place-label").paint["icon-opacity"], 0);
    assert(value.layers.findIndex(layer => layer.id === "fleet-route-line") < value.layers.findIndex(layer => layer.id === "place-label"), "Street labels remain above the route");
    await page.evaluate(() => document.documentElement.dataset.theme = "light");
    await page.waitForTimeout(40);
    assert.equal((await snapshot()).layers.filter(layer => layer.id.startsWith("fleet-")).length, 2, "Reapplying the current theme must retain the route overlay");
    const nav = board.getByRole("navigation", { name: "Dispatch sections", exact: true });
    if (await nav.isVisible()) await activate(nav.getByRole("button", { name: "Map", exact: true }));
    await page.waitForFunction(() => window.__fleetContract.calls.some(call => call.method === "resize"));
    const marker = board.getByRole("button", { name: "Select Van 04 on map", exact: true });
    const position = await marker.evaluate(element => { const rect = element.parentElement.getBoundingClientRect(); return { left: parseFloat(element.style.left), top: parseFloat(element.style.top), width: rect.width, height: rect.height }; });
    const hostBox = await board.locator(".fm-mapbox").boundingBox();
    assert(hostBox && hostBox.width > 100 && hostBox.height > 100, "The asynchronously loaded SDK stylesheet must not collapse the map host");
    assert(Math.abs(position.left - position.width / 2) < 1 && Math.abs(position.top - position.height / 2) < 1, "Markers must use projected pixel positions");
    await page.evaluate(() => { const map = window.__fleetContract.maps.at(-1); map.zoom = 15.5; map.emit("move"); map.emit("zoomend"); });
    await page.waitForFunction(() => document.querySelector('.rs-canvas-zoom')?.textContent === "200%");
    await activate(board.getByRole("button", { name: "Reset", exact: true }));
    assert.equal((await snapshot()).zoom, 14.5, "Reset must change a camera that was zoomed through Mapbox");
    assert.equal(await board.locator(".fm-map-view").getAttribute("data-zoom"), "1");
    await page.evaluate(() => {
      const map = window.__fleetContract.maps.at(-1);
      map.zoom = 14.65;
      map.emit("zoomend", { fleetControl: true });
    });
    assert.equal(await board.locator(".fm-map-view").getAttribute("data-zoom"), "1", "An interrupted programmatic animation must not overwrite the user's newer request");
    await activate(board.getByRole("button", { name: "Zoom in", exact: true }));
    await activate(board.getByRole("button", { name: "Reset", exact: true }));
    const countBeforeResize = (await snapshot()).calls.filter(call => call.method === "resize").length;
    await page.locator(".if-specimen").evaluate(element => element.style.width = `${element.clientWidth - 20}px`);
    await page.waitForFunction(count => window.__fleetContract.calls.filter(call => call.method === "resize").length > count, countBeforeResize);
    await page.evaluate(() => document.documentElement.dataset.theme = "dark");
    await page.waitForFunction(() => window.__fleetContract.maps.at(-1).layers.some(layer => layer.id === "fleet-route-line" && layer.paint["line-color"] === getComputedStyle(document.querySelector(".fm")).getPropertyValue("--text").trim()));
    value = await snapshot();
    assert.equal(value.calls.filter(call => call.method === "setStyle").at(-1).value.style, "mapbox://styles/mapbox/dark-v11");
    assert.deepEqual(value.sources["fleet-route"].features[0].geometry, fixtureRoute([-122.3849, 37.7603], [-122.3905, 37.7568]), "Changing theme retains the selected route");
    if (await nav.isVisible()) await activate(nav.getByRole("button", { name: "Vehicles", exact: true }));
    const failedRoute = route => route.fulfill({ status: 503, contentType: "application/json", body: '{"code":"ServiceUnavailable"}' });
    await page.route("https://api.mapbox.com/directions/v5/**", failedRoute);
    await activate(board.locator(".fm-vehicle").filter({ hasText: "Truck 19" }));
    await board.getByText("Street route unavailable", { exact: true }).waitFor();
    assert.equal((await snapshot()).sources["fleet-route"].features.length, 0, "Failed route selection must clear the previous vehicle's route");
    await page.unroute("https://api.mapbox.com/directions/v5/**", failedRoute);
    await activate(board.getByRole("button", { name: "Retry route", exact: true }));
    await page.waitForFunction(() => document.querySelector(".fm-map-view")?.getAttribute("data-route-status") === "ready");
    value = await snapshot();
    assert.deepEqual(value.sources["fleet-route"].features[0].geometry, fixtureRoute([-122.3869, 37.757], [-122.3894, 37.757]));
    assert.equal(await board.getByRole("button", { name: "Select Truck 19 on map", exact: true }).getAttribute("aria-pressed"), "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await activate(board.getByRole("button", { name: "Zoom in", exact: true }));
    assert.equal((await snapshot()).calls.filter(call => call.method === "easeTo" && call.value.zoom !== undefined).at(-1).value.duration, 0);
    const centeringCount = (await snapshot()).calls.filter(call => call.method === "easeTo" && call.value.center).length;
    await activate(board.getByRole("button", { name: "View trip", exact: true }));
    await board.getByRole("textbox", { name: "Dispatch note", exact: true }).fill("A local note must not move the camera.");
    await activate(board.getByRole("button", { name: "Save note", exact: true }));
    assert.equal((await snapshot()).calls.filter(call => call.method === "easeTo" && call.value.center).length, centeringCount);
    await activate(board.getByRole("button", { name: "Back to map", exact: true }));
    await page.evaluate(() => { const map = window.__fleetContract.maps.at(-1); map.loaded = false; map.emit("error"); });
    await board.getByText("Base map unavailable", { exact: true }).waitFor();
    assert.equal(await board.locator(".fm-map-preview").count(), 1);
    await page.evaluate(() => document.documentElement.dataset.theme = "light");
    await page.waitForFunction(() => document.querySelector(".fm-map-view")?.getAttribute("data-map-status") === "ready");
    assert.equal((await snapshot()).maps, 1, "A successful style reload recovers a transient base-map error without replacing the map");
    await page.evaluate(() => { const map = window.__fleetContract.maps.at(-1); map.loaded = false; map.emit("error"); });
    await board.getByText("Base map unavailable", { exact: true }).waitFor();
    await activate(board.getByRole("button", { name: "Retry", exact: true }));
    await page.waitForFunction(() => window.__fleetContract.maps.length === 2 && document.querySelector(".fm-map-view")?.getAttribute("data-map-status") === "ready");
    value = await snapshot();
    assert.equal(value.removed, 1, "Retry removes the previous map before replacing it");
    assert.equal(value.options.fadeDuration, 0);
    if (await nav.isVisible()) await activate(nav.getByRole("button", { name: "Vehicles", exact: true }));
    await board.getByRole("textbox", { name: "Search vehicles", exact: true }).fill("No matching vehicle");
    await board.getByRole("heading", { name: "No matching vehicles", exact: true }).waitFor();
    assert.equal((await snapshot()).removed, 2, "Removing the map disconnects its SDK instance");
    const callsAfterRemoval = (await snapshot()).calls.length;
    await page.evaluate(() => document.documentElement.dataset.theme = "light");
    await page.waitForTimeout(60);
    assert.equal((await snapshot()).calls.length, callsAfterRemoval, "Theme listeners are removed with the viewer");
    console.log(`${page.viewportSize().width}px: Mapbox SDK contract passed (Directions response, route retry, palette, projection, camera sync, resize, theme, reduced motion, retry, cleanup; simulated SDK only)`);
  } catch (error) { fail(`Mapbox SDK contract: ${error.message}`); }
}
