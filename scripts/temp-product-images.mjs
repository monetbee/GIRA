// TEMP diagnostic: list product image URLs + dimensions. Delete after use.
import { readFileSync } from "node:fs";

// Minimal dotenv parse (never print values).
try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
} catch {
  // .env.local may not exist; fall through to real env
}

const domain = (process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "")
  .replace(/^https?:\/\//i, "")
  .replace(/\/+$/, "");
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

if (!domain || !token) {
  console.log("MISSING_ENV domain:" + Boolean(domain) + " token:" + Boolean(token));
  process.exit(1);
}

const query = `
  query {
    products(first: 12, sortKey: PRODUCT_TYPE) {
      nodes {
        title
        featuredImage { url width height }
        images(first: 3) { nodes { url width height } }
      }
    }
  }
`;

const res = await fetch(`https://${domain}/api/2026-07/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
  },
  body: JSON.stringify({ query }),
});

const json = await res.json();
if (json.errors) {
  console.log("GQL_ERRORS", JSON.stringify(json.errors).slice(0, 300));
  process.exit(1);
}

for (const p of json.data.products.nodes) {
  const img = p.featuredImage || p.images?.nodes?.[0];
  const ratio = img?.width && img?.height ? (img.width / img.height).toFixed(2) : "?";
  console.log(`${p.title} | ${img?.width}x${img?.height} ratio=${ratio} | ${img?.url}`);
}
