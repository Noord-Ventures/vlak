// Exercises the actual native collector against the static export, with every
// ingestion request intercepted locally so verification cannot inflate metrics.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const out = fileURLToPath(new URL('../out/', import.meta.url));
const scriptResponse = await fetch('https://va.vercel-scripts.com/v1/script.js');
assert(scriptResponse.ok);
const nativeScript = await scriptResponse.text();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const reports = [];
async function waitForReport(predicate, message) {
  const deadline = Date.now() + 10_000;
  while (!predicate() && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
  assert(predicate(), message);
}
try {
  for (const hostname of ['vlak.dev', 'www.vlak.dev', 'localhost', 'vlak-git-preview.vercel.app']) {
    // The native collector ignores automation. Emulate a visitor only inside
    // this fully intercepted context; no request can reach production ingestion.
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36' });
    const page = await context.newPage();
    const events = [], errors = [];
    let collectorLoads = 0;
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
    });
    await page.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.hostname !== hostname) return route.abort();
      if (url.pathname === '/_vercel/insights/script.js') {
        collectorLoads++;
        return route.fulfill({ contentType: 'text/javascript', body: nativeScript });
      }
      if (url.pathname.startsWith('/_vercel/insights/')) {
        events.push({ endpoint: url.pathname, data: req.postDataJSON() });
        return route.fulfill({ contentType: 'application/json', body: '{}' });
      }
      let name = path.join(out, decodeURIComponent(url.pathname));
      try {
        const stat = await fs.stat(name);
        if (stat.isDirectory()) name = path.join(name, 'index.html');
        const body = await fs.readFile(name);
        return route.fulfill({ contentType: types[path.extname(name)] || 'application/octet-stream', body });
      } catch {
        return route.fulfill({ status: 404, body: '' });
      }
    });
    await page.goto(`https://${hostname}/docs/?token=SECRET_EMAIL#SECRET_HASH`, { waitUntil: 'networkidle' });
    const production = ['vlak.dev', 'www.vlak.dev'].includes(hostname);
    if (production) {
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      assert.equal(collectorLoads, 1);
      assert(events.some(e => e.endpoint.endsWith('/view') && e.data.o === `https://${hostname}/docs`));
      // Installed after the analytics capture listener, before Next's link
      // handlers: keep this fixture on the docs page while exercising clicks.
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      await page.locator('a[href="https://noord.dev"]').click();
      for (const host of ['www.noord.dev', 'noord.vc', 'www.noord.vc']) {
        const before = events.filter(e => e.data.en === 'network_click' && e.data.ed.destination === 'noord').length;
        await page.evaluate(host => {
          const link = document.createElement('a');
          link.href = `https://${host}/?query=SECRET_DESTINATION#SECRET_DESTINATION`;
          link.textContent = 'Noord analytics test';
          link.dataset.testNoord = host;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }, host);
        await page.waitForTimeout(100);
        assert.equal(events.filter(e => e.data.en === 'network_click' && e.data.ed.destination === 'noord').length, before + 1, host);
      }
      await page.locator('a[href="https://renatovaldes.com"]').click();
      await page.locator('a[href="https://github.com/Noord-Ventures/vlak"]').first().click();
      await page.locator('a[href="https://github.com/Noord-Ventures/vlak/issues/new?template=showcase.yml"]').click();
      await page.locator('.site-footer a[href="/docs/"]').click();
      await page.locator('a[href="/docs/stylex"]').last().click();
      await page.locator('.code-copy').first().click();
      await page.waitForTimeout(250);
      const custom = () => events.filter(e => e.data.en);
      for (const name of ['network_click', 'github_click', 'get_started_click', 'docs_click', 'install_copy', 'project_submit_click']) assert(custom().some(e => e.data.en === name), name);
      assert(custom().some(e => e.data.en === 'network_click' && e.data.ed.destination === 'renatovaldes'));
      assert(custom().every(e => e.data.ed.source === 'vlak'));
      const copied = custom().filter(e => e.data.en === 'install_copy').length;
      await page.locator('.code-copy').nth(1).click(); // An ordinary source example.
      await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw Error('denied'); }; });
      await page.locator('.code-copy').nth(2).click(); // An installation command that fails to copy.
      await page.waitForTimeout(150);
      assert.equal(custom().filter(e => e.data.en === 'install_copy').length, copied);
      const publicEventCount = events.length;
      await page.evaluate(() => {
        history.pushState({}, '', '/account/SECRET_PERSON?token=SECRET_TOKEN#SECRET_FRAGMENT');
        window.va('event', { name: 'network_click', data: { destination: 'noord', email: 'SECRET_FORM_VALUE' } });
        window.va('event', { name: 'unknown_event', data: { text: 'SECRET_FORM_VALUE' } });
      });
      await page.waitForTimeout(200);
      assert.equal(events.length, publicEventCount, 'Private paths must drop page views and custom events');
      await page.evaluate(() => {
        history.pushState({}, '', '/docs/stylex?token=SECRET_TOKEN#SECRET_FRAGMENT');
        window.va('event', { name: 'network_click', data: { destination: 'noord', email: 'SECRET_FORM_VALUE' } });
        window.va('event', { name: 'unknown_event', data: { text: 'SECRET_FORM_VALUE' } });
      });
      await waitForReport(() => events.some(e => e.data.o === `https://${hostname}/docs/stylex`), 'Public navigation should report its redacted URL');
      await waitForReport(() => events.some(e => e.data.o === `https://${hostname}/docs/stylex` && e.data.en === 'network_click'), 'The final privacy fixture event must arrive before the Duo fixture begins');
      assert(!JSON.stringify(events).includes('SECRET'));
      assert(!events.some(e => e.data.en === 'unknown_event'));

      const duoStart = events.length;
      await page.goto(`https://${hostname}/interfaces/ios/?utm_source=LinkedIn&utm_medium=Social%20Post&utm_campaign=Duo%20Launch%202026`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.getByRole('button', { name: 'Open display' }).click();
      await page.getByRole('button', { name: 'Copy install command' }).click();
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      await page.getByRole('link', { name: 'Installation guide' }).first().click();
      await page.getByRole('link', { name: 'GitHub source' }).click();
      await page.waitForTimeout(350);
      const duoEvents = events.slice(duoStart).filter(e => e.data.en);
      for (const name of ['duo_open', 'outer_screen', 'fold_transition', 'inner_screen', 'docs_from_duo', 'install_from_duo', 'github_click']) assert(duoEvents.some(e => e.data.en === name), name);
      assert(duoEvents.every(e => e.data.ed.channel === 'linkedin'), JSON.stringify(duoEvents));
      assert(duoEvents.every(e => e.data.ed.campaign_source === 'linkedin' && e.data.ed.campaign_medium === 'social-post' && e.data.ed.campaign_name === 'duo-launch-2026'));

      await page.goto(`https://${hostname}/docs/`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      await page.locator('a[href="https://github.com/Noord-Ventures/vlak"]').first().click();
      await page.waitForTimeout(150);
      const persisted = events.filter(e => e.data.en === 'github_click').at(-1);
      assert.equal(persisted.data.ed.channel, 'linkedin');
      assert.equal(persisted.data.ed.campaign_name, 'duo-launch-2026');

      const growthStart = events.length;
      await page.goto(`https://${hostname}/`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      for (const choice of ['prototype', 'agent', 'install']) await page.locator(`[data-start-path="${choice}"]`).click();
      await page.goto(`https://${hostname}/starters/`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      for (const slug of ['ios', 'android', 'calendar', 'reconciliation', 'line']) await page.locator(`a[href="/starter/${slug}.zip"]`).click();
      await page.goto(`https://${hostname}/interfaces/line/`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.getByRole('button', { name: 'Copy build brief', exact: true }).click();
      await page.getByRole('button', { name: 'Copy install command', exact: true }).click();
      await page.goto(`https://${hostname}/updates/`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__vlakSiteAnalytics && window.vai);
      await page.evaluate(() => document.addEventListener('click', e => e.preventDefault(), { capture: true }));
      await page.locator('a[href="/rss.xml"]').first().click();
      await page.locator('a[href="https://github.com/Noord-Ventures/vlak/releases"]').first().click();
      await page.waitForTimeout(300);
      const growthEvents = events.slice(growthStart).filter(e => e.data.en);
      for (const name of ['start_choice', 'starter_open', 'starter_download', 'agent_setup_open', 'setup_copy', 'interface_install', 'updates_follow']) assert(growthEvents.some(e => e.data.en === name), name);
      assert.equal(growthEvents.filter(e => e.data.en === 'starter_download').length, 5);
      assert.equal(growthEvents.filter(e => e.data.en === 'start_choice').length, 3);
      assert(growthEvents.every(e => e.data.ed.channel === 'linkedin' && e.data.ed.campaign_name === 'duo-launch-2026'));
      assert(!JSON.stringify(growthEvents).includes('SECRET'));
    } else {
      await page.waitForTimeout(100);
      assert.equal(collectorLoads, 0);
      assert.equal(events.length, 0);
    }
    assert.equal((await context.cookies()).length, 0);
    assert.deepEqual(errors, []);
    reports.push({ hostname, collectorLoads, interceptedEvents: events.length, errors });
    await context.close();
  }
  console.log(JSON.stringify({ passed: true, reports }, null, 2));
} finally {
  await browser.close();
}
