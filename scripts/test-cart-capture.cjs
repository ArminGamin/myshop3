const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const assert = require("node:assert/strict");
const { test } = require("node:test");

let slots = [], cursor = 0, effects = [], timers = new Map(), calls = [], timerId = 0, status = 200;
const paid = { current: false };
const same = (a, b) => a && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
const react = {
  useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
  useCallback(callback, deps) {
    const index = cursor++;
    if (!same(slots[index]?.deps, deps)) slots[index] = { callback, deps };
    return slots[index].callback;
  },
  useEffect(effect, deps) {
    const index = cursor++;
    if (!same(slots[index]?.deps, deps)) {
      slots[index]?.cleanup?.();
      slots[index] = { deps };
      effects.push(() => { slots[index].cleanup = effect(); });
    }
  },
};
const originalLoad = Module._load;
Module._load = function(specifier, ...args) {
  if (specifier === "react") return react;
  if (specifier === "@/lib/security/csrf-client") return { apiHeaders: () => ({ "x-csrf-token": "test" }) };
  return originalLoad.call(this, specifier, ...args);
};
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
};
const { useCartReminders } = require("../src/lib/email/use-cart-reminders.ts");
const originalFetch = global.fetch;
global.window = {
  setTimeout(callback, delay) { assert.equal(delay, 800); timers.set(++timerId, callback); return timerId; },
  clearTimeout(id) { timers.delete(id); },
};
global.fetch = async (url, input) => {
  assert.equal(url, "/api/checkout/reminders");
  assert.equal(input.keepalive, true);
  assert.equal(input.headers["x-csrf-token"], "test");
  calls.push(JSON.parse(input.body));
  return new Response("{}", { status });
};
const addons = { protection: true, donation: false, priority: false };
const lines = [{ slug: "silkinis-miego-rinkinys-miegas", variantId: "vyndaris", qty: 2 }];
function render(email = "test@gmail.com", cart = lines) {
  cursor = 0;
  const capture = useCartReminders(email, cart, addons, false, paid);
  effects.splice(0).forEach(effect => effect());
  return capture;
}
test.beforeEach(() => { slots = []; effects = []; timers.clear(); calls = []; paid.current = false; status = 200; });
test("leaving the email field captures immediately and clears the typing timer", async () => {
  const capture = render();
  assert.equal(calls.length, 0);
  assert.equal(await capture(), true);
  assert.equal(calls.length, 1);
  assert.equal(timers.size, 0);
  assert.deepEqual(calls[0], { email: "test@gmail.com", lines, addons, mysteryGift: false });
});
test("typing without leaving the field retains the 800 ms fallback", async () => {
  render();
  for (const callback of [...timers.values()]) callback();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 1);
});
test("repeated blur and fallback callbacks save the same cart once", async () => {
  const capture = render();
  await Promise.all([capture(), capture(), capture()]);
  assert.equal(calls.length, 1);
});
test("queued stale email captures are discarded in favour of the latest cart", async () => {
  const outdated = render("old@gmail.com");
  const first = outdated();
  const latest = render("new@gmail.com", [{ ...lines[0], qty: 1 }]);
  assert.equal(await first, false);
  assert.equal(await latest(), true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].email, "new@gmail.com");
  assert.equal(calls[0].lines[0].qty, 1);
});
test("a failed capture can be retried without changing customer fields", async () => {
  const capture = render();
  status = 503;
  assert.equal(await capture(), false);
  status = 200;
  assert.equal(await capture(), true);
  assert.equal(calls.length, 2);
});
test("payment completion suppresses queued capture", async () => {
  const capture = render();
  const pending = capture();
  paid.current = true;
  assert.equal(await pending, false);
  assert.equal(calls.length, 0);
});
test.after(() => { global.fetch = originalFetch; delete global.window; Module._load = originalLoad; });
