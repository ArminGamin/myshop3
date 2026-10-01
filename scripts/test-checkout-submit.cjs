const fs = require("node:fs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");
const source = fs.readFileSync(require("node:path").join(__dirname, "../src/components/commerce/checkout-experience.tsx"), "utf8");
const ast = ts.createSourceFile("checkout.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let onSubmit;
function find(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === "onSubmit") onSubmit = node.getText(ast); ts.forEachChild(node, find); }
find(ast);
const compiled = ts.transpileModule(onSubmit, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
function fixture({ serverTotal = 2939 } = {}) {
  const state = { submitted: [], confirmed: [], banners: [], busy: [], submitting: { current: false }, latestTotal: { current: 2939 } };
  let release;
  const deps = {
    model: { form: {}, addons: { protection: true, priority: false, donation: false }, mystery: false, totalCents: 2939, stripeEnabled: true, setErrors() {}, setBanner(message) { state.banners.push(message); }, markPaid() {} },
    cart: { lines: [{ slug: "candle", variantId: "first", qty: 1 }], clearCart() {} },
    validateCustomer: () => ({ errors: {}, value: {} }), FIELD_ORDER: [], paymentReady: true,
    stripe: { confirmPayment: async (input) => { state.confirmed.push(input); return { paymentIntent: { status: "succeeded", id: "mock_intent" } }; } },
    elements: { submit: () => new Promise(resolve => { release = resolve; }) },
    setBusy: value => state.busy.push(value), submitting: state.submitting, latestTotal: state.latestTotal,
    apiHeaders: () => ({}), router: { push() {} }, window: { location: { origin: "https://test.invalid" } },
    stripeBanner: () => "error", document: { getElementById: () => null },
    fetch: async (_, input) => { state.submitted.push(JSON.parse(input.body)); return { ok: true, status: 200, json: async () => ({ clientSecret: "mock_secret", totalCents: serverTotal }) }; },
  };
  const submit = new Function(...Object.keys(deps), compiled + ";return onSubmit;")(...Object.values(deps));
  return { state, deps, submit, release: () => release({}) };
}

test("a displayed amount change during payment prevents confirmation and unlocks retry", async () => {
  const f = fixture(), pending = f.submit({ preventDefault() {} });
  f.state.latestTotal.current = 3539;
  f.deps.cart.lines[0].qty = 2;
  f.release(); await pending;
  assert.equal(f.state.confirmed.length, 0);
  assert.equal(f.state.submitted[0].lines[0].qty, 1);
  assert.equal(f.state.submitted[0].expectedTotalCents, 2939);
  assert.equal(f.state.submitting.current, false);
  assert.match(f.state.banners.at(-1), /suma pasikeitė/);
});

test("rapid duplicate submits create and confirm only one payment", async () => {
  const f = fixture(), first = f.submit({ preventDefault() {} });
  await f.submit({ preventDefault() {} });
  f.release(); await first;
  assert.equal(f.state.submitted.length, 1);
  assert.equal(f.state.confirmed.length, 1);
});

test("a server amount different from the reviewed total cannot be confirmed", async () => {
  const f = fixture({ serverTotal: 3000 });
  const pending = f.submit({ preventDefault() {} });
  f.release(); await pending;
  assert.equal(f.state.confirmed.length, 0);
  assert.equal(f.state.submitting.current, false);
});

test("all native amount-changing controls are inside the disabled payment fieldset", () => {
  let fieldset;
  function visit(node) {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === "fieldset") fieldset = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert(fieldset);
  assert.match(fieldset.openingElement.getText(ast), /disabled=\{busy\}/);
  assert.match(fieldset.getText(ast), /CheckoutShippingUpsells/);
  assert.match(fieldset.getText(ast), /OrderSummary/);
});
