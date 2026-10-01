const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "public/mystery-gift.png");
const stage = path.join(root, ".tmp-qa/quality-pilots/deterministic-edgecase");

async function main() {
  const input = fs.readFileSync(source);
  const output = await sharp(input)
    .sharpen({ sigma: 0.8, m1: 0.35, m2: 0.65, x1: 2, y2: 3, y3: 3 })
    .webp({ quality: 95, effort: 6, smartSubsample: true, smartDeblock: true })
    .toBuffer();
  const before = await sharp(input).metadata();
  const after = await sharp(output).metadata();
  if (before.width !== after.width || before.height !== after.height || before.hasAlpha !== after.hasAlpha) {
    throw new Error("Gift image geometry changed");
  }
  const hash = crypto.createHash("sha256").update(output).digest("hex").slice(0, 10);
  const name = `mystery-gift-q2-${hash}.webp`;
  fs.mkdirSync(stage, { recursive: true });
  const stagedPath = path.join(stage, name);
  if (!fs.existsSync(stagedPath)) fs.writeFileSync(stagedPath, output, { flag: "wx" });
  console.log(JSON.stringify({ source, stagedPath, futureUrl: `/${name}`, originalBytes: input.length, enhancedBytes: output.length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
