const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
const originalFetch = global.fetch;
let stripeCalls = [];
const stripe = {
  paymentIntents: { create: async (input) => { stripeCalls.push(input); return { client_secret: "mock_secret" }; } },
  checkout: { sessions: { create: async (input) => { stripeCalls.push(input); return { url: "https://checkout.test/session" }; } } },
};
Module._load = function(specifier, parent, ...args) {
  if (specifier === "server-only") return {};
  if (specifier.includes("instrumentation")) return { posthogLoggerProvider: undefined };
  if (specifier === "next/server") return { ...originalLoad.call(this, specifier, parent, ...args), after: () => {} };
  if (specifier === "@/lib/stripe") return { getStripe: () => stripe };
  if (specifier === "@/lib/security/guard") return { denyPost: () => null };
  if (specifier === "@/lib/analytics") return { track: () => {} };
  if (specifier.startsWith("@/")) specifier = path.join(root, "src", specifier.slice(2));
  return originalLoad.call(this, specifier, parent, ...args);
};
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
global.fetch = async () => { throw new Error("Unmocked network access is forbidden in tests"); };
after(() => { global.fetch = originalFetch; Module._load = originalLoad; });
const { canViewProduct, products } = require("../src/lib/data/products.ts");
const { makeSizeVariants, selectedSizeVariantId, SIZE_SELECTION_REQUIRED } = require("../src/lib/commerce/size-variants.ts");
const { buildOrder, parseLines, orderTotalError } = require("../src/lib/cart/server-order.ts");
const { MAX_ORDER_LINES, normalizeQuantity } = require("../src/lib/cart/limits.ts");
const { resolveItems, subtotalOf } = require("../src/lib/cart/store.ts");
const { cartStore } = require("../src/lib/cart/store.ts");
const { addonAmounts } = require("../src/lib/cart/addons.ts");
const { store } = require("../src/lib/config/store.config.ts");
const { MYSTERY_GIFT } = require("../src/lib/cart/mystery-gift.ts");
const { isAllowedEmail } = require("../src/lib/security/email.ts");
const { validateCustomer } = require("../src/lib/checkout/customer.ts");
const { csrfMatches } = require("../src/lib/security/csrf.ts");
const { orderSnapshot, snapshotMetadata, readSnapshot } = require("../src/lib/email/templates.ts");
const intent = require("../src/app/api/checkout/intent/route.ts");
const hosted = require("../src/app/api/checkout/route.ts");
const newsletter = require("../src/app/api/newsletter/route.ts");
const feed = require("../src/app/feed.xml/route.ts");
const { proxy } = require("../src/proxy.ts");
const { NextRequest } = require("next/server");
const { notifyDiscordOrder } = require("../src/lib/orders/discord-webhook.ts");
const customer = { email: "buyer@company.example.lt", name: "Ąžuolas", surname: "Žiema", address: "Testų gatvė 12", city: "Šiauliai", postalCode: "01100", phone: "+37060000000", region: "" };
const addons = { protection: true, donation: false, priority: false };
const line = (p, qty = 1, variantId = p.defaultVariantId) => ({ slug: p.slug, variantId, qty });
const payload = () => {
  const lines = [line(products[0])];
  return { lines, addons, mysteryGift: false, customer, expectedTotalCents: buildOrder(parseLines(lines), addons, false).totalCents };
};
const request = (body) => new Request("https://store.test/api/checkout", { method: "POST", body: JSON.stringify(body) });

test("valid business emails pass checkout; malformed addresses remain rejected", () => {
  for (const email of ["buyer@company.example.lt", "buyer@mail-2.company.lt", "first.last+tag@gmail.com", "a@inbox.lt"]) assert(isAllowedEmail(email), email);
  assert.deepEqual(validateCustomer(customer).errors, {});
  for (const email of ["not-an-email", "buyer..name@example.lt", "buyer@-example.lt", "buyer@example", "buyer@.lt"]) assert(!isAllowedEmail(email), email);
});

test("client and server normalize fractional, invalid and excessive quantities identically", () => {
  for (const qty of [1.5, 10.9, 999, 0, -1, NaN, Infinity]) {
    const lines = [line(products[0], qty)];
    const resolved = resolveItems(lines);
    const parsed = parseLines(lines);
    assert.equal(resolved[0]?.qty || 0, parsed[0]?.qty || 0);
    if (parsed.length) assert.equal(subtotalOf(resolved), buildOrder(parsed, {}).subtotal);
  }
  assert.equal(normalizeQuantity("1.5"), 1);
  assert.equal(normalizeQuantity("invalid"), 0);
});

test("31-product orders preserve every line and the complete email snapshot", () => {
  const lines = products.filter(p => p.inStock).slice(0, 31).map(p => line(p));
  const parsed = parseLines(lines), order = buildOrder(parsed, addons);
  assert.equal(parsed.length, 31);
  assert.equal(order.rawLines.length, 31);
  assert.equal(order.subtotal, subtotalOf(resolveItems(lines)));
  const snapshot = readSnapshot(snapshotMetadata(orderSnapshot(order)));
  assert.equal(snapshot.items.length, order.lineItems.length);
  assert.equal(snapshot.totalCents, order.totalCents);
});

test("the explicit line limit rejects excess orders instead of silently truncating them", () => {
  const lines = Array.from({ length: MAX_ORDER_LINES + 1 }, () => line(products[0]));
  assert.equal(parseLines(lines).length, MAX_ORDER_LINES + 1);
  assert.match(buildOrder(parseLines(lines), {}).error, new RegExp(String(MAX_ORDER_LINES)));
  const atLimit = buildOrder(parseLines(lines.slice(0, MAX_ORDER_LINES)), {});
  assert.equal(atLimit.rawLines.length, MAX_ORDER_LINES);
  assert.deepEqual(readSnapshot(snapshotMetadata(orderSnapshot(atLimit))), orderSnapshot(atLimit));
});

test("all variant, quantity, gift and add-on combinations retain identical checkout arithmetic", () => {
  let scenarios = 0;
  for (const p of products.filter(p => p.inStock)) for (const v of p.variants) for (let qty = 1; qty <= 10; qty++) {
    for (let mask = 0; mask < 8; mask++) for (const mysteryGift of [false, true]) {
      const selected = { protection: !!(mask & 1), donation: !!(mask & 2), priority: !!(mask & 4) };
      const lines = [line(p, qty, v.id)], subtotal = subtotalOf(resolveItems(lines));
      const gift = mysteryGift ? MYSTERY_GIFT.priceCents : 0;
      const shipping = mysteryGift || subtotal >= store.shipping.freeThresholdCents ? 0 : store.shipping.flatRateCents;
      const expected = subtotal + gift + addonAmounts(subtotal + gift, selected).total + shipping;
      const order = buildOrder(parseLines(lines), selected, mysteryGift);
      assert.equal(order.totalCents, expected);
      assert.equal(orderTotalError(order, expected), null);
      scenarios++;
    }
  }
  assert(scenarios >= 16000);
});

test("new Christmas clothing uses screenshot-confirmed sizes and reviewed retail prices", async () => {
  const roles = { "JK-057": ["woman"], "JK-058": ["child", "woman", "man"], "JK-059": ["woman", "man"], "JK-060": ["child", "woman", "man"] };
  const prices = { "JK-057": 1799, "JK-058": 1999, "JK-059": 1899, "JK-060": 1999 };
  const confirmedSizes = {
    "JK-057": [["S (EU 36)", "M (EU 38)", "L (EU 40/42)"]],
    "JK-058": [["3Y", "4Y", "5Y", "6Y", "7Y"], ["S", "M", "L", "XL", "2XL", "3XL"], ["S", "M", "L", "XL", "2XL", "3XL"]],
    "JK-059": [["M (EU 38)", "L (EU 40/42)", "XL (EU 44)", "XXL (EU 46)"], ["M (EU 38)", "L (EU 40/42)", "XL (EU 44)", "XXL (EU 46)"]],
    "JK-060": [["Kids 4-5Y", "Kids 6Y", "Kids 7-8Y", "Kids 9-10Y", "Kids 11-12Y"], ["Mom S", "Mom M", "Mom L", "Mom XL", "Mom 2XL"], ["Dad S", "Dad M", "Dad L", "Dad XL", "Dad 2XL"]],
  };
  const sourceIds = { "JK-057": "1005010074119128", "JK-058": "1005013181918869", "JK-059": "1005012560695508", "JK-060": "1005010102733468" };
  const links = fs.readFileSync(path.join(root, "product-links.txt"), "utf8");
  const xml = await (await feed.GET()).text();
  for (const [sku, expectedRoles] of Object.entries(roles)) {
    const product = products.find(p => p.sku === sku);
    assert(product, sku);
    assert.equal(product.inStock, true);
    assert.equal(product.priceCents, prices[sku]);
    assert(product.priceCents >= 1500 && product.priceCents <= 2000);
    assert.equal(product.defaultVariantId, SIZE_SELECTION_REQUIRED);
    assert.deepEqual(product.sizeGroups.map(group => group.id), expectedRoles);
    assert.deepEqual(product.sizeGroups.map(group => group.sizes), confirmedSizes[sku]);
    assert.equal(product.variants.length, product.sizeGroups.reduce((count, group) => count * group.sizes.length, 1));
    assert.equal(new Set(product.variants.map(variant => variant.id)).size, product.variants.length);
    assert.equal(selectedSizeVariantId(product.sizeGroups, {}), null);
    assert.equal(selectedSizeVariantId(product.sizeGroups, Object.fromEntries(product.sizeGroups.map(group => [group.id, group.sizes[0]]))), product.variants[0].id);
    assert(product.images.length > 0);
    for (const image of product.images) {
      assert(image.endsWith(".webp") && fs.existsSync(path.join(root, "public", image)), image);
    }
    assert(links.includes(`https://www.aliexpress.com/item/${sourceIds[sku]}.html`));
    assert(xml.includes(`<g:id>${sku}</g:id>`));
  }
});

test("new Christmas clothing product pages are available with reviewed prices", () => {
  const product = products.find(p => p.sku === "JK-057");
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert(canViewProduct(product));
    assert.equal(proxy(new NextRequest(`https://store.test/produktai/${product.slug}`)).status, 200);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});

test("each chosen family size survives cart resolution, Stripe line naming and feed activation", async () => {
  const product = products.find(p => p.sku === "JK-058");
  const originalPrice = product.priceCents;
  product.inStock = true;
  product.priceCents = 8990;
  try {
    const selected = { child: product.sizeGroups[0].sizes[1], woman: product.sizeGroups[1].sizes[2], man: product.sizeGroups[2].sizes[3] };
    const variantId = selectedSizeVariantId(product.sizeGroups, selected);
    const reorderedGroups = [...product.sizeGroups].reverse().map(group => ({ ...group, sizes: [...group.sizes].reverse() }));
    assert.equal(selectedSizeVariantId(reorderedGroups, selected), variantId);
    assert(makeSizeVariants(reorderedGroups).some(variant => variant.id === variantId));
    const variant = product.variants.find(v => v.id === variantId);
    assert(variant);
    const lines = [line(product, 1, variantId)];
    cartStore.clear();
    cartStore.add(line(product, 1, SIZE_SELECTION_REQUIRED), { silent: true });
    assert.equal(cartStore.get().length, 0);
    cartStore.add(lines[0], { silent: true });
    assert.equal(cartStore.get()[0].variantId, variantId);
    const resolved = resolveItems(lines);
    assert.equal(resolved[0].variant.name, variant.name);
    const order = buildOrder(parseLines(lines), {}, false);
    assert.equal(order.subtotal, resolved[0].lineTotalCents);
    assert.equal(orderSnapshot(order).items[0].name, order.lineItems[0].price_data.product_data.name);
    for (const value of [selected.child, selected.woman, selected.man]) assert(order.lineItems[0].price_data.product_data.name.includes(value));
    assert.match(buildOrder(parseLines([line(product, 1, SIZE_SELECTION_REQUIRED)]), {}, false).error, /dydžius/);
    const xml = await (await feed.GET()).text();
    assert(xml.includes(`<g:id>${product.sku}</g:id>`));
    assert(xml.includes(product.images[0]));
    assert(xml.includes("Apparel &amp; Accessories &gt; Clothing"));
  } finally {
    cartStore.clear();
    product.inStock = true;
    product.priceCents = originalPrice;
  }
});

test("new Christmas prices reach Stripe and the order snapshot unchanged", async () => {
  const christmas = products.filter((product) => /^JK-05[7-9]|JK-060$/.test(product.sku));
  assert.equal(christmas.length, 4);
  for (const product of christmas) {
    const lines = [line(product, 1, product.variants[0].id)];
    const order = buildOrder(parseLines(lines), {}, false);
    assert.equal(order.lineItems[0].price_data.unit_amount, product.priceCents);
    for (const route of [intent, hosted]) {
      stripeCalls = [];
      const body = {
        lines,
        addons: { protection: false, donation: false, priority: false },
        mysteryGift: false,
        customer,
        expectedTotalCents: order.totalCents,
      };
      const response = await route.POST(request(body));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).totalCents, order.totalCents);
      assert.equal(stripeCalls.length, 1);
      const input = stripeCalls[0];
      if (input.amount != null) {
        assert.equal(input.amount, order.totalCents);
      } else {
        const productLine = input.line_items.find((item) => item.price_data?.unit_amount === product.priceCents);
        assert(productLine, `${product.sku} unit price missing from hosted checkout`);
      }
      assert.deepEqual(readSnapshot(input.metadata), orderSnapshot(order));
    }
  }
});

for (const [name, route] of [["PaymentIntent", intent], ["hosted Checkout", hosted]]) {
  test(`${name} rejects missing, changed or fractional expected totals without calling Stripe`, async () => {
    for (const expectedTotalCents of [undefined, 1, 1234.5, "2939"]) {
      stripeCalls = [];
      const response = await route.POST(request({ ...payload(), expectedTotalCents }));
      assert.equal(response.status, 409);
      assert.equal(stripeCalls.length, 0);
    }
  });
  test(`${name} sends the reviewed amount and returns it for final reconciliation`, async () => {
    stripeCalls = [];
    const body = payload(), response = await route.POST(request(body)), data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.totalCents, body.expectedTotalCents);
    assert.equal(stripeCalls.length, 1);
    const input = stripeCalls[0];
    const total = input.amount ?? input.line_items.reduce((sum, l) => sum + l.quantity * l.price_data.unit_amount, 0) + input.shipping_options[0].shipping_rate_data.fixed_amount.amount;
    assert.equal(total, body.expectedTotalCents);
  });
  test(`${name} rejects null JSON without creating payment`, async () => {
    stripeCalls = [];
    assert.equal((await route.POST(request(null))).status, 400);
    assert.equal(stripeCalls.length, 0);
  });
  test(`${name} retains all 31 basket products in the charged amount and order snapshot`, async () => {
    stripeCalls = [];
    const body = { ...payload(), lines: products.filter(p => p.inStock).slice(0, 31).map(p => line(p)) };
    body.expectedTotalCents = buildOrder(parseLines(body.lines), addons).totalCents;
    const response = await route.POST(request(body));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).totalCents, body.expectedTotalCents);
    const input = stripeCalls[0];
    assert.deepEqual(readSnapshot(input.metadata), orderSnapshot(buildOrder(parseLines(body.lines), addons)));
    const total = input.amount ?? input.line_items.reduce((sum, l) => sum + l.quantity * l.price_data.unit_amount, 0) + input.shipping_options[0].shipping_rate_data.fixed_amount.amount;
    assert.equal(total, body.expectedTotalCents);
  });
}

test("malformed encoded CSRF cookies return false, not an exception", () => {
  assert.equal(csrfMatches(new Request("https://store.test", { headers: { cookie: "kk_csrf=%ZZ", "x-csrf-token": "x" } })), false);
  assert.equal(csrfMatches(new Request("https://store.test", { headers: { cookie: "kk_csrf=valid", "x-csrf-token": "valid" } })), true);
});

test("unknown catalog URLs are rejected before streaming while valid products keep their normal route", () => {
  for (const pathname of ["/produktai/not-in-catalog", "/dovanos/not-in-catalog", "/produktai/%ZZ", "/straipsniai/not-an-article"]) {
    const response = proxy(new NextRequest(`https://store.test${pathname}`));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-middleware-rewrite"), "https://store.test/404");
    assert(response.headers.has("content-security-policy"));
  }
  assert.equal(proxy(new NextRequest(`https://store.test/produktai/${products[0].slug}`)).status, 200);
});

test("newsletter reports provider errors instead of a successful subscription", async () => {
  process.env.KLAVIYO_API_KEY = "test-private-key";
  process.env.KLAVIYO_LIST_ID = "test-list";
  for (const status of [400, 500]) {
    global.fetch = async (url) => { assert.equal(url, "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/"); return new Response("{}", { status }); };
    const response = await newsletter.POST(request({ email: customer.email, consent: true }));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  }
});

test("configured newsletter uses the server subscription job contract before reporting acceptance", async () => {
  process.env.KLAVIYO_API_KEY = "test-private-key";
  process.env.KLAVIYO_LIST_ID = "test-list";
  delete process.env.NEWSLETTER_WEBHOOK_URL;
  let calls = 0;
  global.fetch = async (url, input) => {
    calls++;
    assert.equal(url, "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/");
    const body = JSON.parse(input.body).data;
    assert.equal(body.type, "profile-subscription-bulk-create-job");
    assert.equal(body.relationships.list.data.id, "test-list");
    assert.equal(body.attributes.profiles.data[0].attributes.email, customer.email);
    assert.equal(body.attributes.profiles.data[0].attributes.subscriptions.email.marketing.consent, "SUBSCRIBED");
    return new Response(null, { status: 202 });
  };
  const response = await newsletter.POST(request({ email: customer.email, consent: true }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, mode: "klaviyo" });
  assert.equal(calls, 1);
});

test("newsletter captures requests through Discord only after successful delivery", async () => {
  delete process.env.KLAVIYO_API_KEY;
  delete process.env.KLAVIYO_LIST_ID;
  process.env.NEWSLETTER_WEBHOOK_URL = "https://discord.test/newsletter";
  for (const [providerStatus, expectedStatus] of [[204, 200], [500, 503]]) {
    global.fetch = async (url) => { assert.equal(url, "https://discord.test/newsletter"); return new Response(null, { status: providerStatus }); };
    const response = await newsletter.POST(request({ email: customer.email, consent: true }));
    assert.equal(response.status, expectedStatus);
    const body = await response.json();
    assert.equal(body.ok, providerStatus === 204);
    if (body.ok) assert.equal(body.mode, "captured");
  }
});

test("newsletter cannot claim success without a delivery destination or consent", async () => {
  delete process.env.NEWSLETTER_WEBHOOK_URL;
  global.fetch = async () => { throw new Error("No network call expected"); };
  assert.equal((await newsletter.POST(request({ email: customer.email, consent: true }))).status, 503);
  for (const body of [null, { email: customer.email, consent: "true" }, { email: 7, consent: true }]) {
    assert.equal((await newsletter.POST(request(body))).status, 400);
  }
});

test("all 840 gift quiz combinations keep every recommendation within the selected budget", () => {
  const source = fs.readFileSync(path.join(root, "src/components/commerce/gift-finder-quiz.tsx"), "utf8");
  const ast = ts.createSourceFile("quiz.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const statements = ast.statements.filter(n => ts.isVariableStatement(n) && n.declarationList.declarations.some(d => ["steps", "budgetRange"].includes(d.name.getText(ast))) || ts.isFunctionDeclaration(n) && n.name?.text === "scoreProducts");
  const compiled = ts.transpileModule(statements.map(n => n.getText(ast)).join("\n"), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const { steps, budgetRange, scoreProducts } = new Function("products", compiled + ";return {steps,budgetRange,scoreProducts};")(products);
  let combinations = 0;
  for (const recipient of steps[0].options) for (const budget of steps[1].options) for (const vibe of steps[2].options) for (const occasion of steps[3].options) {
    const results = scoreProducts({ recipient: recipient.value, budget: budget.value, vibe: vibe.value, occasion: occasion.value });
    const [min, max] = budgetRange[budget.value];
    assert(results.length > 0);
    for (const { p } of results) assert(p.priceCents >= min && p.priceCents <= max, `${budget.value}: ${p.slug}`);
    combinations++;
  }
  assert.equal(combinations, 840);
});

test("large order notifications retain every saved product, variant and charged line amount", async () => {
  process.env.ORDER_WEBHOOK_URL = "https://discord.test/orders";
  const lines = products.filter(p => p.inStock).slice(0, 31).map(p => line(p));
  const order = buildOrder(parseLines(lines), addons);
  const snapshot = orderSnapshot(order);
  let calls = 0;
  let captured;
  global.fetch = async (url, input) => {
    calls++;
    captured = { url, input };
    return new Response(null, { status: 204 });
  };
  await notifyDiscordOrder({ orderId: "pi_mock_123", amountCents: order.totalCents, metadata: { cart: "truncated legacy cart", ...snapshotMetadata(snapshot) } });
  assert.equal(calls, 1);
  assert.equal(captured.url, "https://discord.test/orders");
  assert(captured.input.body instanceof FormData);
  assert.equal(captured.input.headers, undefined);
  const details = await captured.input.body.get("files[0]").text();
  for (const item of snapshot.items) assert(details.includes(`${item.name} × ${item.quantity} — €${(item.unitAmount * item.quantity / 100).toFixed(2)}`), item.name);
  const payload = JSON.parse(captured.input.body.get("payload_json"));
  assert.match(payload.embeds[0].fields.find(field => field.name === "Prekės").value, /Visas sąrašas/);
  for (const field of payload.embeds[0].fields) assert(field.value.length <= 1024);
});

test("older small orders retain their original JSON notification format", async () => {
  process.env.ORDER_WEBHOOK_URL = "https://discord.test/orders";
  let calls = 0;
  let captured;
  global.fetch = async (url, input) => {
    calls++;
    captured = { url, input };
    return new Response(null, { status: 204 });
  };
  await notifyDiscordOrder({ orderId: "pi_mock_123", amountCents: 2490, metadata: { cart: JSON.stringify([{ s: products[0].slug, v: products[0].defaultVariantId, q: 1 }]) } });
  assert.equal(calls, 1);
  assert.equal(captured.url, "https://discord.test/orders");
  assert.equal(captured.input.headers["Content-Type"], "application/json");
  const payload = JSON.parse(captured.input.body);
  assert(payload.embeds[0].fields.find(field => field.name === "Prekės").value.includes(products[0].name));
});
