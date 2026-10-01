import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { notifyDiscordOrder } from "../src/lib/orders/discord-webhook";

function loadEnvFile(name: string) {
  try {
    const raw = readFileSync(resolve(process.cwd(), name), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* missing file */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

if (!process.env.ORDER_WEBHOOK_URL) {
  console.error("ORDER_WEBHOOK_URL is not set in .env.local");
  process.exit(1);
}

async function main() {
  const delivered = await notifyDiscordOrder({
    orderId: "pi_test_preview_footer",
    amountCents: 4880,
    metadata: {
      name: "Testas",
      surname: "Klientas",
      email: "test@kaledukampelis.lt",
      phone: "+37060000000",
      address: "Gedimino pr. 1, Vilnius 01103",
      cart: JSON.stringify([
        { s: "kilimas-silta-grindys", v: "kreminis", q: 1 },
        { s: "raktu-pakabukas-namai", v: "rudas", q: 1 },
      ]),
      addons: JSON.stringify({ p: 0, d: 0, r: 0, m: 0 }),
    },
  });
  if (!delivered) {
    console.error("Discord test order notification was rejected or could not be delivered.");
    process.exit(1);
  }
  console.log("Discord test order notification delivered.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
