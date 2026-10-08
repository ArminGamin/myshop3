const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");

// Load the real TypeScript handlers with isolated Stripe/Workflow boundaries.
const root = path.resolve(__dirname, "..");
const load = Module._load;
const resolve = Module._resolveFilename;
let clock = [];
let sent = [];
let runs = new Map();
let started = [];
let payment;
let apiStatus = 200;
let discordStatus = 200;
let discordReports = [];
let paidMatches = [];
let workflowRunId = "wrun_cart";
let orderNotifications = [];
const stripeWebhooks = new (require("stripe"))("sk_test_local_fixture").webhooks;
class FatalError extends Error {}
class RetryableError extends Error {}
const stripe = {
  webhooks: stripeWebhooks,
  paymentIntents: {
    search: async () => ({ data: paidMatches }),
    retrieve: async () => payment,
    update: async (_, input) => { Object.assign(payment.metadata, input.metadata); return payment; },
  },
};
const workflowApi = {
  getRun: (id) => ({
    get exists() { return Promise.resolve(runs.has(id)); },
    get status() { return Promise.resolve(runs.get(id)); },
    cancel: async () => { runs.set(id, "cancelled"); },
  }),
  start: async (workflow, args) => {
    const runId = `wrun_test_${started.length}`;
    started.push({ runId, args, workflow }); runs.set(runId, "running");
    return { runId };
  },
};
Module._resolveFilename = function(specifier, ...args) {
  if (specifier.startsWith("@/")) specifier = path.join(root, "src", specifier.slice(2));
  return resolve.call(this, specifier, ...args);
};
Module._load = function(specifier, ...args) {
  if (specifier === "workflow") return { FatalError, RetryableError, getWorkflowMetadata: () => ({ workflowRunId }), sleep: async (date) => { clock.push(date.getTime()); } };
  if (specifier === "workflow/api") return workflowApi;
  if (specifier === "@/lib/stripe") return { getStripe: () => stripe };
  if (specifier === "@/lib/orders/discord-webhook") return { notifyDiscordOrder: async (input) => { orderNotifications.push(input); } };
  if (specifier === "@/lib/analytics") return { track: () => {} };
  return load.call(this, specifier, ...args);
};
require.extensions[".ts"] = function(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(result.outputText, filename);
};
process.env.RESEND_API_KEY = "test-key-never-sent";
process.env.RESEND_FROM = "Kalėdų Kampelis <labas@kaledukampelis.com>";
process.env.EMAIL_AUTOMATION_SECRET = "test-secret-for-email-automation-32-characters";
process.env.NEXT_PUBLIC_SITE_URL = "https://www.kaledukampelis.com";
delete process.env.REMINDER_WEBHOOK_URL;
delete process.env.PRE_PURCHASE_WEBHOOK_URL;
delete process.env.PRE_PURCHASE_EMAIL_WEBHOOK_URL;
const realFetch = global.fetch;
global.fetch = async (url, input) => {
  if (String(url).startsWith("https://discord.test/")) {
    discordReports.push(JSON.parse(input.body));
    return new Response(JSON.stringify({ id: "discord_test" }), { status: discordStatus });
  }
  assert.equal(url, "https://api.resend.com/emails");
  sent.push({ body: JSON.parse(input.body), key: input.headers["Idempotency-Key"] });
  return new Response(JSON.stringify({ id: "email_test", name: "validation_error" }), { status: apiStatus });
};
const { buildOrder } = require("../src/lib/cart/server-order.ts");
const { resolveItems, subtotalOf } = require("../src/lib/cart/store.ts");
const templates = require("../src/lib/email/templates.ts");
const tokens = require("../src/lib/email/tokens.ts");
const workflows = require("../src/workflows/customer-emails.ts");
const automation = require("../src/lib/email/automation.ts");
const transport = require("../src/lib/email/resend.ts");
const reminderDiscord = require("../src/lib/email/reminder-discord.ts");
const reminderNotifications = require("../src/workflows/reminder-notification.ts");
const prepurchaseDiscord = require("../src/lib/email/prepurchase-discord.ts");
const prepurchaseNotifications = require("../src/workflows/prepurchase-notification.ts");
const capture = require("../src/app/api/checkout/reminders/route.ts");
const unsubscribe = require("../src/app/api/email/unsubscribe/route.ts");
const recover = require("../src/app/api/checkout/recover/route.ts");
const stripeWebhook = require("../src/app/api/stripe/webhook/route.ts");
const { CSRF_COOKIE, CSRF_HEADER } = require("../src/lib/security/csrf.ts");
const lines = [{ slug: "silkinis-miego-rinkinys-miegas", variantId: "vyndaris", qty: 2 }];
const built = buildOrder(lines, { protection: true, donation: true, priority: true }, true);
assert.ok(!("error" in built));
const order = templates.orderSnapshot(built);
const details = { email: "test@gmail.com", lines, addons: built.addons, mysteryGift: true };
const cart = { ...details, order, startedAt: 1_800_000_000_000 };

function request(body, cookie = "") {
  return new Request("https://www.kaledukampelis.com/api/checkout/reminders", {
    method: "POST", headers: { host: "www.kaledukampelis.com", origin: "https://www.kaledukampelis.com", [CSRF_HEADER]: "test-csrf", cookie: `${CSRF_COOKIE}=test-csrf; ${cookie}`, "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

test("all five templates replace placeholders and escape customer/product HTML", async () => {
  const unsafe = { items: [{ name: '<script>alert("x")</script>', quantity: 1, unitAmount: 1290 }], shippingCents: 390, totalCents: 1680 };
  const purchase = await templates.renderPurchase({ orderId: "pi_test", paidAt: cart.startedAt, order: unsafe, address: '<img src=x onerror="bad">\nVilnius' });
  assert.ok(!purchase.includes("{{") && !purchase.includes("<script>") && !purchase.includes("<img src=x"));
  assert.ok(purchase.includes("&lt;script&gt;") && purchase.includes("<br>Vilnius"));
  for (const hour of [1, 24, 48, 72]) {
    const html = await templates.renderReminder(hour, order, "https://example.com/?a=1&b=2", "https://example.com/unsubscribe");
    assert.ok(!html.includes("{{"));
    assert.ok(html.includes("a=1&amp;b=2"));
    assert.ok(html.includes("https://example.com/unsubscribe"));
  }
});
test("large carts keep complete price snapshots through Stripe metadata chunks", () => {
  const large = { ...order, items: Array.from({ length: 30 }, (_, i) => ({ name: `Prekė ${i} — variantas & spalva`, quantity: 2, unitAmount: 2490 })) };
  assert.deepEqual(templates.readSnapshot(templates.snapshotMetadata(large)), large);
});
test("cart previews and checkout apply the same bundle prices as the server", () => {
  for (const qty of [1, 2, 3, 10]) {
    const cartLines = [{ ...lines[0], qty }];
    const server = buildOrder(cartLines, { protection: false, donation: false, priority: false }, false);
    assert.ok(!("error" in server));
    const client = resolveItems(cartLines);
    assert.equal(client[0].unitPriceCents, server.lineItems[0].price_data.unit_amount);
    assert.equal(subtotalOf(client), server.subtotal);
  }
});
test("recovery tokens reject tampering and expiration without revealing customer email", () => {
  const token = tokens.sealToken({ purpose: "recover", runId: "wrun_cart", cart });
  assert.deepEqual(tokens.openToken(token).cart, cart);
  assert.ok(!token.includes(cart.email));
  assert.equal(tokens.openToken(token.slice(0, -8) + "AAAAAAAA"), null);
  const now = Date.now;
  Date.now = () => now() + 8 * 24 * 60 * 60_000;
  try { assert.equal(tokens.openToken(token), null); } finally { Date.now = now; }
});
test("reminders are due at absolute 1, 24, 48 and 72 hours with separate idempotency keys", async () => {
  sent = []; clock = []; runs.set("wrun_cart", "running");
  await workflows.cartReminderWorkflow(cart);
  assert.deepEqual(clock, [1, 24, 48, 72].map(h => cart.startedAt + h * 3600_000));
  assert.equal(sent.length, 4);
  assert.deepEqual(sent.map(s => s.key), [1, 24, 48, 72].map(h => `cart/wrun_cart/${h}`));
  assert.ok(sent.every(s => s.body.headers["List-Unsubscribe-Post"] === "List-Unsubscribe=One-Click"));
  const links = sent.map(s => s.body.html.match(/href="([^"]+recover[^"]+)"/)[1]);
  assert.ok(links.every(link => link === links[0]));
});
test("cancelled carts send no reminders", async () => {
  sent = []; runs.set("wrun_cart", "cancelled");
  await workflows.cartReminderWorkflow(cart);
  assert.equal(sent.length, 0);
});
test("a purchase in another browser or before cart capture suppresses every reminder", async () => {
  sent = []; runs.set("wrun_cart", "running"); paidMatches = [{ id: "pi_paid_elsewhere" }];
  try { await workflows.cartReminderWorkflow(cart); assert.equal(sent.length, 0); } finally { paidMatches = []; }
});
test("paid orders use the stored prices and mark the confirmation sent; replays do not resend", async () => {
  sent = [];
  payment = { id: "pi_test", status: "succeeded", receipt_email: "test@gmail.com", amount: order.totalCents, amount_received: order.totalCents, created: cart.startedAt / 1000, metadata: templates.snapshotMetadata(order), shipping: { name: "Testas", address: { line1: "Gatvė 1", city: "Vilnius", postal_code: "12345", country: "LT" } } };
  await workflows.purchaseConfirmationWorkflow(payment.id);
  await workflows.purchaseConfirmationWorkflow(payment.id);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].key, "purchase/pi_test");
  assert.equal(payment.metadata.email_confirmation_sent, "email_test");
});
test("unpaid orders cannot send purchase confirmations", async () => {
  sent = []; payment.status = "requires_payment_method"; delete payment.metadata.email_confirmation_sent;
  await assert.rejects(workflows.purchaseConfirmationWorkflow(payment.id), FatalError);
  assert.equal(sent.length, 0);
});
test("payment webhook queue cancels the cart and deduplicates repeated events", async () => {
  started = []; runs.set("wrun_cart", "running"); payment.metadata.email_cart_run = "wrun_cart";
  await automation.queuePurchaseEmail(payment.id, payment.metadata);
  await automation.queuePurchaseEmail(payment.id, payment.metadata);
  assert.equal(runs.get("wrun_cart"), "cancelled");
  assert.equal(started.length, 1);
});
test("capture rejects missing CSRF, saves once, and cancels outdated cart runs", async () => {
  const denied = await capture.POST(new Request("https://www.kaledukampelis.com/api/checkout/reminders", { method: "POST", body: JSON.stringify(details) }));
  assert.equal(denied.status, 403);
  started = [];
  const first = await capture.POST(request(details));
  assert.equal(first.status, 200);
  const cookie = first.headers.get("set-cookie").split(";")[0];
  await capture.POST(request(details, cookie));
  assert.equal(started.length, 1);
  await capture.POST(request({ ...details, lines: [{ ...lines[0], qty: 1 }] }, cookie));
  assert.equal(started.length, 2);
  assert.equal(runs.get("wrun_test_0"), "cancelled");
});
test("unsubscribe cancels the run and retains suppression for that cart", async () => {
  runs.set("wrun_cart", "running");
  const fingerprint = tokens.cartFingerprint(details);
  const token = tokens.sealToken({ purpose: "unsubscribe", runId: "wrun_cart", fingerprint });
  const response = await unsubscribe.POST(new Request(`https://www.kaledukampelis.com/api/email/unsubscribe?token=${token}`, { method: "POST" }));
  assert.equal(response.status, 200);
  assert.equal(runs.get("wrun_cart"), "cancelled");
  const before = started.length;
  await capture.POST(request(details, response.headers.get("set-cookie").split(";")[0]));
  assert.equal(started.length, before);
});
test("recovery restores the signed workflow session across devices", async () => {
  const token = tokens.sealToken({ purpose: "recover", runId: "wrun_cart", cart });
  const response = await recover.GET(new Request(`https://www.kaledukampelis.com/api/checkout/recover?token=${token}`));
  assert.equal(response.status, 307);
  const session = tokens.readCartSession(new Request("https://www.kaledukampelis.com", { headers: { cookie: response.headers.get("set-cookie").split(";")[0] } }));
  assert.equal(session.runId, "wrun_cart");
  assert.equal(session.fingerprint, tokens.cartFingerprint(details));
});
test("Resend failures retry transient errors and reject permanent errors", async () => {
  const input = { to: "test@gmail.com", subject: "Test", html: "Test", idempotencyKey: "test" };
  apiStatus = 429; await assert.rejects(transport.sendEmail(input), RetryableError);
  apiStatus = 422; await assert.rejects(transport.sendEmail(input), FatalError);
  apiStatus = 200;
});
test("captured cart reminders, signed successful order webhook and confirmation complete the customer flow", async () => {
  started = []; sent = []; orderNotifications = []; clock = [];
  const response = await capture.POST(request(details));
  assert.equal(response.status, 200);
  const savedCart = started[0].args[0];
  workflowRunId = started[0].runId;
  try {
    await workflows.cartReminderWorkflow(savedCart);
    assert.equal(sent.length, 4);
    assert.ok(sent.every(message => message.body.html.includes(templates.euro(order.totalCents))));
    payment = { id: "pi_local_success", status: "succeeded", receipt_email: details.email, amount: order.totalCents, amount_received: order.totalCents, created: Date.now() / 1000, metadata: { ...templates.snapshotMetadata(order), cart: JSON.stringify(lines), email: details.email, email_cart_run: workflowRunId }, shipping: { name: "Testinis gavėjas", address: { line1: "Testų gatvė 1", city: "Vilnius", postal_code: "12345", country: "LT" } } };
    const payload = JSON.stringify({ id: "evt_local_success", type: "payment_intent.succeeded", data: { object: payment } });
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_local_customer_flow_test";
    const signature = stripeWebhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
    const originalLog = console.log;
    let paidResponse;
    try {
      console.log = () => {};
      paidResponse = await stripeWebhook.POST(new Request("https://www.kaledukampelis.com/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": signature }, body: payload }));
    } finally { console.log = originalLog; }
    assert.equal(paidResponse.status, 200);
    assert.equal(runs.get(workflowRunId), "cancelled");
    assert.equal(orderNotifications.length, 1);
    assert.equal(orderNotifications[0].amountCents, order.totalCents);
    assert.equal(started.length, 2);
    await workflows.purchaseConfirmationWorkflow(payment.id);
    assert.equal(sent.length, 5);
    assert.ok(sent[4].body.html.includes("pi_local_success".slice(-12).toUpperCase()));
    assert.ok(sent[4].body.html.includes(templates.euro(order.totalCents)));
    await workflows.purchaseConfirmationWorkflow(payment.id);
    await workflows.cartReminderWorkflow(savedCart);
    assert.equal(sent.length, 5);
  } finally { workflowRunId = "wrun_cart"; }
});
test("Discord reminder reports include all reminder types and Vilnius time down to seconds", () => {
  for (const hour of [1, 24, 48, 72]) {
    const payload = reminderDiscord.reminderDiscordPayload({ recipient: "test@gmail.com", hour, emailId: "email_test", sentAt: "2026-09-28T12:34:56.000Z", cartRunId: "wrun_cart", test: true });
    const embed = payload.embeds[0];
    assert.equal(embed.title, "[TEST] Krepšelio priminimas išsiųstas");
    assert.deepEqual(payload.allowed_mentions.parse, []);
    assert.equal(embed.fields[0].value, "test@gmail.com");
    assert.equal(embed.fields[1].value, `${hour} val. priminimas`);
    assert.equal(embed.fields[2].value, "2026-09-28 15:34:56");
    assert.equal(embed.fields[3].value, "email_test");
    assert.equal(embed.timestamp, "2026-09-28T12:34:56.000Z");
  }
  const winter = reminderDiscord.reminderDiscordPayload({ recipient: "test@gmail.com", hour: 1, emailId: "email_test", sentAt: "2026-12-28T12:34:56.000Z", cartRunId: "wrun_cart" });
  assert.equal(winter.embeds[0].fields[2].value, "2026-12-28 14:34:56");
});
test("successful reminder sends queue separate Discord workflows and notification retries do not resend mail", async () => {
  process.env.REMINDER_WEBHOOK_URL = "https://discord.test/webhook";
  started = []; sent = []; discordReports = []; apiStatus = 200; paidMatches = [];
  runs.set("wrun_cart", "running");
  try {
    await workflows.cartReminderWorkflow(cart);
    assert.equal(sent.length, 4);
    assert.equal(started.length, 4);
    assert.deepEqual(started.map(run => run.args[0].hour), [1, 24, 48, 72]);
    for (const run of started) {
      assert.equal(run.workflow, reminderNotifications.reminderNotificationWorkflow);
      assert.equal(run.args[0].recipient, cart.email);
      assert.equal(run.args[0].emailId, "email_test");
      assert.ok(Number.isFinite(Date.parse(run.args[0].sentAt)));
      await run.workflow(...run.args);
    }
    assert.equal(discordReports.length, 4);
    discordStatus = 429;
    await assert.rejects(started[0].workflow(...started[0].args), RetryableError);
    discordStatus = 503;
    await assert.rejects(started[0].workflow(...started[0].args), RetryableError);
    discordStatus = 400;
    await assert.rejects(started[0].workflow(...started[0].args), FatalError);
    discordStatus = 200;
    await started[0].workflow(...started[0].args);
    assert.equal(sent.length, 4);
  } finally { delete process.env.REMINDER_WEBHOOK_URL; discordStatus = 200; }
});
test("failed email sends and paid or cancelled carts never report a reminder as sent", async () => {
  process.env.REMINDER_WEBHOOK_URL = "https://discord.test/webhook";
  started = []; sent = []; apiStatus = 429; runs.set("wrun_cart", "running");
  try {
    await assert.rejects(workflows.cartReminderWorkflow(cart), RetryableError);
    assert.equal(started.length, 0);
    apiStatus = 200; sent = []; runs.set("wrun_cart", "cancelled");
    await workflows.cartReminderWorkflow(cart);
    runs.set("wrun_cart", "running"); paidMatches = [{ id: "pi_paid" }];
    await workflows.cartReminderWorkflow(cart);
    assert.equal(started.length, 0);
    assert.equal(sent.length, 0);
  } finally { delete process.env.REMINDER_WEBHOOK_URL; apiStatus = 200; paidMatches = []; }
});
test("captured carts queue both pre-purchase channels separately before reminder sends", async () => {
  process.env.PRE_PURCHASE_WEBHOOK_URL = "https://discord.test/cart";
  process.env.PRE_PURCHASE_EMAIL_WEBHOOK_URL = "https://discord.test/email";
  started = []; sent = []; discordReports = []; runs.set("wrun_cart", "running");
  try {
    await workflows.cartReminderWorkflow(cart);
    assert.equal(started.length, 2);
    assert.deepEqual(started.map(run => run.args[1]), ["cart", "email"]);
    for (const run of started) {
      assert.equal(run.workflow, prepurchaseNotifications.prepurchaseNotificationWorkflow);
      assert.equal(run.args[0].cart.email, cart.email);
      assert.equal(run.args[0].cartRunId, "wrun_cart");
      await run.workflow(...run.args);
    }
    assert.equal(discordReports.length, 2);
    assert.match(discordReports[0].embeds[0].title, /Pradėtas užsakymas/);
    assert.match(discordReports[1].embeds[0].title, /el\. paštas užfiksuotas/);
    assert.ok(discordReports.every(payload => payload.embeds[0].fields[0].value === cart.email));
    assert.ok(discordReports.every(payload => payload.embeds[0].fields[1].value === `${(order.totalCents / 100).toFixed(2)} €`));
    assert.ok(discordReports.every(payload => payload.embeds[0].fields[3].value.includes("Bordo")));
    const before = sent.length;
    discordStatus = 429;
    await assert.rejects(started[0].workflow(...started[0].args), RetryableError);
    discordStatus = 400;
    await assert.rejects(started[0].workflow(...started[0].args), FatalError);
    assert.equal(sent.length, before);
    discordStatus = 200; started = []; runs.set("wrun_cart", "cancelled");
    await workflows.cartReminderWorkflow(cart);
    assert.equal(started.length, 0);
  } finally {
    delete process.env.PRE_PURCHASE_WEBHOOK_URL;
    delete process.env.PRE_PURCHASE_EMAIL_WEBHOOK_URL;
    discordStatus = 200;
  }
});
test("pre-purchase test reports clearly identify saved contacts and suppress mentions", () => {
  const payload = prepurchaseDiscord.prepurchaseDiscordPayload({ cart, cartRunId: "TEST-cart", test: true }, "email");
  assert.match(payload.embeds[0].title, /^\[TEST\]/);
  assert.match(payload.embeds[0].description, /Priminimai suplanuoti/);
  assert.equal(payload.embeds[0].timestamp, new Date(cart.startedAt).toISOString());
  assert.deepEqual(payload.allowed_mentions.parse, []);
});
test.after(() => { global.fetch = realFetch; });
