// IndexNow: po kiekvieno production diegimo praneša Bing (ir per jį ChatGPT paieškai), kurie puslapiai yra svetainėje.
// Paleidžiama iš vercel.json buildCommand; klaida niekada nesustabdo diegimo.
import fs from "node:fs";

const KEY = "67633942878449f18760d15826292a56";
const HOST = "www.kaledukampelis.com";

try {
  if (process.env.VERCEL && process.env.VERCEL_ENV !== "production") process.exit(0);
  const built = ".next/server/app/sitemap.xml.body";
  const xml = fs.existsSync(built) ? fs.readFileSync(built, "utf8") : await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes(HOST));
  if (urlList.length === 0) throw new Error("sitemap tuščias");
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
  });
  console.log(`[indexnow] ${urlList.length} adresų, atsakymas ${res.status}`);
} catch (error) {
  console.warn("[indexnow] praleista:", error instanceof Error ? error.message : error);
}
