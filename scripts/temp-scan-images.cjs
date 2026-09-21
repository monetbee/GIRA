// TEMP: scan .next output for Shopify CDN image URLs. Delete after use.
const fs = require("fs");
const path = require("path");
const out = [];
function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(html|rsc)$/.test(f)) {
      const c = fs.readFileSync(p, "utf8");
      if (c.includes("cdn.shopify.com")) {
        const u = [...new Set([...c.matchAll(/https:\/\/cdn\.shopify\.com[^"'\s)]+/g)].map((m) => m[0]))];
        if (u.length) out.push({ file: p, urls: u.slice(0, 6) });
      }
    }
  }
}
walk(".next");
console.log(JSON.stringify(out, null, 1));
